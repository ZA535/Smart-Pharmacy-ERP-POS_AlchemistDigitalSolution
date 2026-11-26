import { supplierService } from "../services/supplier.service.js";
import { asyncHandler } from "../utils/async-handler.util.js";
import { createSupplierSchema } from "../validators/index.js";

export const listSuppliers = asyncHandler(async (_req, res) => {
  res.json(await supplierService.list());
});

export const createSupplier = asyncHandler(async (req, res) => {
  const parsed = createSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.status(201).json(await supplierService.create(parsed.data));
});
