// types/product.ts

// Product entity type
export interface Model {
  id: string;
  name: string;
  slug: string;
  salesCount: number;
  inventoryCount: number;
  salesTotal: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Payload for creating a new product
export type ModelPayload = {
  name: string;
};

// Payload for updating an existing product
export type UpdateModelPayload = {
  name?: string;
};

// API response type
export type ProductApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
};
