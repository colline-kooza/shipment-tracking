import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
export const db = new PrismaClient().$extends(withAccelerate());
const globalForPrisma = global as unknown as { prisma: typeof db };
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
