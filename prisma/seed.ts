import { UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { db } from "./db";

async function main() {
  try {
    // Clean existing data
    console.log("🗑️ Cleaning existing data...");
    await db.user.deleteMany();

    // Create the Org
    const org = await db.organisation.create({
      data: {
        name: "Greenlink Freight Logistics Limited",
      },
    });

    // Create users
    console.log("👥 Creating users...");
    const currentYear = new Date().getFullYear();
    const adminPassword = `Admin@${currentYear}`;
    const userPassword = `User@${currentYear}`;
    const hashedAdminPassword = await hash(adminPassword, 10);
    const hashedUserPassword = await hash(userPassword, 10);
    const adminUser = await db.user.create({
      data: {
        name: "Admin User",
        firstName: "Admin",
        lastName: "User",
        email: "admin@admin.com",
        phone: "+1234567890",
        password: hashedAdminPassword,
        role: UserRole.ADMIN,
        jobTitle: "System Administrator",
        isVerfied: true,
        status: true,
        orgId: org.id,
        orgName: org.name,
      },
    });

    const regularUser = await db.user.create({
      data: {
        name: "Regular User",
        firstName: "Regular",
        lastName: "User",
        email: "user@user.com",
        phone: "+1987654321",
        password: hashedUserPassword,
        role: UserRole.USER,
        jobTitle: "Software Developer",
        isVerfied: true,
        status: true,
        orgId: org.id,
        orgName: org.name,
      },
    });
    console.log("Seeding Users completed successfully!");
    console.log("Admin credentials:", {
      email: "admin@admin.com",
      password: adminPassword,
    });
    console.log("User credentials:", {
      email: "user@user.com",
      password: userPassword,
    });

    console.log("✅ Seed data created successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
