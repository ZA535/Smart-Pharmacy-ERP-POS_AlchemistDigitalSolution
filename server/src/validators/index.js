import { z } from "zod";

// —— Auth ——
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// —— Catalog ——
export const categoryNameSchema = z.object({ name: z.string().min(1) });

export const createMedicineSchema = z.object({
  name: z.string().min(1),
  genericFormula: z.string().optional(),
  categoryId: z.string(),
  lowStockThreshold: z.number().int().positive().optional(),
  expiryAlertDays: z.number().int().positive().nullable().optional(),
});

export const updateMedicineSchema = z.object({
  name: z.string().min(1).optional(),
  genericFormula: z.string().optional(),
  lowStockThreshold: z.number().int().positive().optional(),
  expiryAlertDays: z.number().int().positive().nullable().optional(),
});

// —— Inventory ——
export const manualStockSchema = z.object({
  medicineId: z.string(),
  batchNumber: z.string().min(1),
  expiryDate: z.string(),
  quantity: z.number().int().positive(),
  purchasePrice: z.number().positive(),
  mrp: z.number().positive(),
});

export const billLineSchema = z.object({
  medicineId: z.string().optional(),
  medicineName: z.string(),
  categoryId: z.string(),
  batchNumber: z.string(),
  expiryDate: z.string(),
  quantity: z.number().int().positive(),
  purchasePrice: z.number().positive(),
  mrp: z.number().positive(),
});

export const confirmBillSchema = z.object({
  items: z.array(billLineSchema).min(1),
});

// —— Purchase orders ——
export const createPOSchema = z.object({
  supplierId: z.string(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        medicineId: z.string(),
        quantityOrdered: z.number().int().positive(),
      })
    )
    .min(1),
});

export const poFromAlertSchema = z.object({
  supplierId: z.string(),
  medicineIds: z.array(z.string()).min(1),
});

// —— Suppliers ——
export const createSupplierSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});

// —— POS ——
export const checkoutSchema = z.object({
  lines: z
    .array(
      z.object({
        medicineId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
});

// —— Returns ——
export const customerReturnSchema = z.object({
  invoiceNumber: z.string(),
  items: z
    .array(
      z.object({
        saleItemId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const supplierReturnSchema = z.object({
  supplierId: z.string(),
  reason: z.string().optional(),
  items: z
    .array(
      z.object({
        batchId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

// —— Alerts ——
export const alertSettingsSchema = z.object({
  globalExpiryLeadDays: z.number().int().positive(),
});
