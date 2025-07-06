"use server";

import { db } from "@/prisma/db";
import { getAuthUser } from "@/config/useAuth";
import { revalidatePath } from "next/cache";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type CreateCustomerDTO = {
  name: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  address?: string;
  country?: string;
  passport?: string;
  company?: string;
  consignee?: string;
  notes?: string;
};

export type UpdateCustomerDTO = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  address?: string;
  country?: string;
  passport?: string;
  company?: string;
  consignee?: string;
  notes?: string;
};

export type CustomerListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contactPerson: string | null;
  company: string | null;
  consignee: string | null;
  isActive: boolean;
  _count: {
    shipments: number;
  };
  createdAt: Date;
};

export type CustomerFilters = {
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "shipments";
  sortOrder?: "asc" | "desc";
};

export type CustomerListResponse = {
  customers: CustomerListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

/** * Create a new customer */
export async function createCustomer(
  data: CreateCustomerDTO
): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // Check if customer with same name already exists
    const existingCustomer = await db.customer.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
        isActive: true, // Only check active customers
      },
    });

    if (existingCustomer) {
      return {
        success: false,
        error: "Customer with this name already exists",
      };
    }

    const customer = await db.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        contactPerson: data.contactPerson,
        address: data.address,
        country: data.country,
        passport: data.passport,
        company: data.company,
        consignee: data.consignee,
        notes: data.notes,
      },
    });

    revalidatePath("/dashboard/customers");
    return {
      success: true,
      data: customer,
    };
  } catch (error) {
    console.error("Failed to create customer:", error);
    return {
      success: false,
      error: "Failed to create customer: " + (error as Error).message,
    };
  }
}

/** * Update an existing customer */
export async function updateCustomer(
  data: UpdateCustomerDTO
): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // Check if customer exists
    const existingCustomer = await db.customer.findUnique({
      where: { id: data.id },
    });

    if (!existingCustomer) {
      return {
        success: false,
        error: "Customer not found",
      };
    }

    // Check if new name conflicts with existing customers (excluding current customer)
    if (data.name !== existingCustomer.name) {
      const conflictingCustomer = await db.customer.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: "insensitive",
          },
          isActive: true,
          NOT: {
            id: data.id,
          },
        },
      });

      if (conflictingCustomer) {
        return {
          success: false,
          error: "Customer with this name already exists",
        };
      }
    }

    const customer = await db.customer.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        contactPerson: data.contactPerson,
        address: data.address,
        country: data.country,
        passport: data.passport,
        company: data.company,
        consignee: data.consignee,
        notes: data.notes,
      },
    });

    revalidatePath("/dashboard/customers");
    return {
      success: true,
      data: customer,
    };
  } catch (error) {
    console.error("Failed to update customer:", error);
    return {
      success: false,
      error: "Failed to update customer: " + (error as Error).message,
    };
  }
}

/** * Get customers with pagination and filtering */
export async function getCustomers(
  filters: CustomerFilters = {}
): Promise<ApiResponse<CustomerListResponse>> {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const {
      searchQuery = "",
      page = 1,
      limit = 12, // Changed default to match your component
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      isActive: true,
    };

    if (searchQuery && searchQuery.trim() !== "") {
      whereClause.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
        { phone: { contains: searchQuery, mode: "insensitive" } },
        { company: { contains: searchQuery, mode: "insensitive" } },
        { contactPerson: { contains: searchQuery, mode: "insensitive" } },
        { consignee: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    // Build order by clause
    let orderBy: any = {};
    if (sortBy === "shipments") {
      orderBy = {
        shipments: {
          _count: sortOrder,
        },
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    console.log("Query filters:", { whereClause, orderBy, skip, limit }); // Debug log

    const [customers, totalCount] = await Promise.all([
      db.customer.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              shipments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.customer.count({
        where: whereClause,
      }),
    ]);

    console.log("Found customers:", customers.length, "Total:", totalCount); // Debug log

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        customers,
        totalCount,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return {
      success: false,
      error: "Failed to fetch customers: " + (error as Error).message,
    };
  }
}

/** * Get customer by ID */
export async function getCustomerById(id: string): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const customer = await db.customer.findUnique({
      where: { id, isActive: true },
      include: {
        shipments: {
          select: {
            id: true,
            reference: true,
            trackingNumber: true,
            status: true,
            type: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Only get recent shipments
        },
        _count: {
          select: {
            shipments: true,
          },
        },
      },
    });

    if (!customer) {
      return {
        success: false,
        error: "Customer not found",
      };
    }

    return {
      success: true,
      data: customer,
    };
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return {
      success: false,
      error: "Failed to fetch customer: " + (error as Error).message,
    };
  }
}

/** * Delete a customer (soft delete) */
export async function deleteCustomer(id: string): Promise<ApiResponse<any>> {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // Check if customer has shipments
    const customerWithShipments = await db.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            shipments: true,
          },
        },
      },
    });

    if (!customerWithShipments) {
      return {
        success: false,
        error: "Customer not found",
      };
    }

    if (customerWithShipments._count.shipments > 0) {
      return {
        success: false,
        error: "Cannot delete customer with existing shipments",
      };
    }

    // Soft delete by setting isActive to false
    await db.customer.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    revalidatePath("/dashboard/customers");
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return {
      success: false,
      error: "Failed to delete customer: " + (error as Error).message,
    };
  }
}

/** * Search customers for dropdown/select components */
export async function searchCustomers(
  query: string
): Promise<ApiResponse<any[]>> {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // If query is empty or just whitespace, return all customers (limited)
    const searchQuery = query.trim();

    const whereClause: any = {
      isActive: true,
    };

    if (searchQuery.length > 0) {
      whereClause.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { company: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
        { consignee: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    console.log("Search query:", searchQuery, "Where clause:", whereClause); // Debug log

    const customers = await db.customer.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        company: true,
        consignee: true,
        email: true,
        phone: true,
      },
      take: 20, // Increased limit
      orderBy: {
        name: "asc",
      },
    });

    console.log("Search results:", customers.length); // Debug log

    return {
      success: true,
      data: customers,
    };
  } catch (error) {
    console.error("Failed to search customers:", error);
    return {
      success: false,
      error: "Failed to search customers: " + (error as Error).message,
    };
  }
}
