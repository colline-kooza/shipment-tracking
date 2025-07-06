// types/product.ts

// Product entity type
export interface Product {
  id: string;
  name: string;
  price: string;
  numberPlate: string;
  modelId: string;
  modelName: string;
  salesCount: number;
  salesTotal: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Payload for creating a new product
export type ProductPayload = {
  name: string;
  price: string;
  numberPlate: string;
  modelId?: string;
  modelName?: string;
};

// Payload for updating an existing product
export type UpdateProductPayload = {
  name?: string;
  price?: string;
  numberPlate?: string;
  modelName?: string;
  modelId?: string;
};

// API response type
export type ProductApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
};
