import { z } from 'zod';

// Price validation - 2 decimal places max, reasonable range
export const priceSchema = z
  .string()
  .trim()
  .refine((val) => val !== '', { message: 'Price is required' })
  .refine((val) => !isNaN(parseFloat(val)), { message: 'Price must be a valid number' })
  .refine((val) => parseFloat(val) >= 0, { message: 'Price cannot be negative' })
  .refine((val) => parseFloat(val) <= 10000000, { message: 'Price exceeds maximum limit (10,000,000)' })
  .refine((val) => {
    const parts = val.split('.');
    return !parts[1] || parts[1].length <= 2;
  }, { message: 'Price can have at most 2 decimal places' })
  .transform((val) => parseFloat(val));

// Quantity validation for dosage
export const quantitySchema = z
  .string()
  .trim()
  .refine((val) => val !== '', { message: 'Quantity is required' })
  .refine((val) => !isNaN(parseFloat(val)), { message: 'Quantity must be a valid number' })
  .refine((val) => parseFloat(val) > 0, { message: 'Quantity must be greater than 0' })
  .refine((val) => parseFloat(val) <= 1000, { message: 'Quantity exceeds maximum (1000)' })
  .transform((val) => parseFloat(val));

// Days validation
export const daysSchema = z
  .string()
  .trim()
  .refine((val) => val !== '', { message: 'Days is required' })
  .refine((val) => !isNaN(parseInt(val)), { message: 'Days must be a valid number' })
  .refine((val) => parseInt(val) >= 1, { message: 'Days must be at least 1' })
  .refine((val) => parseInt(val) <= 365, { message: 'Days cannot exceed 365' })
  .transform((val) => parseInt(val));

// Frequency validation
export const frequencySchema = z
  .string()
  .refine((val) => ['1', '2', '3', '4'].includes(val), { message: 'Invalid frequency' })
  .transform((val) => parseInt(val));

// Service quantity validation
export const serviceQtySchema = z
  .string()
  .trim()
  .refine((val) => val !== '', { message: 'Quantity is required' })
  .refine((val) => !isNaN(parseFloat(val)), { message: 'Quantity must be a valid number' })
  .refine((val) => parseFloat(val) >= 1, { message: 'Quantity must be at least 1' })
  .refine((val) => parseFloat(val) <= 100, { message: 'Quantity cannot exceed 100' })
  .transform((val) => parseFloat(val));

// Item name validation
export const itemNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Name is required' })
  .max(200, { message: 'Name must be less than 200 characters' })
  .refine((val) => !/[<>{}]/.test(val), { message: 'Name contains invalid characters' });

// Category name validation
export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Category is required' })
  .max(100, { message: 'Category must be less than 100 characters' });

// Full inventory item schema for import validation
export const inventoryItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(200),
  price: z.number().nonnegative().max(10000000),
  type: z.string().optional(),
  category: z.string().optional(),
});

export type ValidatedInventoryItem = z.infer<typeof inventoryItemSchema>;

export const inventoryImportSchema = z.array(inventoryItemSchema);

// Validate price input with error message
export function validatePrice(value: string): { valid: boolean; error?: string; value?: number } {
  const result = priceSchema.safeParse(value);
  if (result.success) {
    return { valid: true, value: result.data };
  }
  return { valid: false, error: result.error.errors[0]?.message || 'Invalid price' };
}

// Validate quantity input with error message
export function validateQuantity(value: string): { valid: boolean; error?: string; value?: number } {
  const result = quantitySchema.safeParse(value);
  if (result.success) {
    return { valid: true, value: result.data };
  }
  return { valid: false, error: result.error.errors[0]?.message || 'Invalid quantity' };
}

// Validate days input with error message
export function validateDays(value: string): { valid: boolean; error?: string; value?: number } {
  const result = daysSchema.safeParse(value);
  if (result.success) {
    return { valid: true, value: result.data };
  }
  return { valid: false, error: result.error.errors[0]?.message || 'Invalid days' };
}

// Validate service quantity input with error message
export function validateServiceQty(value: string): { valid: boolean; error?: string; value?: number } {
  const result = serviceQtySchema.safeParse(value);
  if (result.success) {
    return { valid: true, value: result.data };
  }
  return { valid: false, error: result.error.errors[0]?.message || 'Invalid quantity' };
}

// Validate item name with error message
export function validateItemName(value: string): { valid: boolean; error?: string; value?: string } {
  const result = itemNameSchema.safeParse(value);
  if (result.success) {
    return { valid: true, value: result.data };
  }
  return { valid: false, error: result.error.errors[0]?.message || 'Invalid name' };
}

// Validate imported inventory data
export function validateInventoryImport(data: unknown): { 
  valid: boolean; 
  error?: string; 
  data?: z.infer<typeof inventoryImportSchema> 
} {
  const result = inventoryImportSchema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  return { 
    valid: false, 
    error: `Invalid data format: ${result.error.errors[0]?.message || 'Unknown error'}` 
  };
}
