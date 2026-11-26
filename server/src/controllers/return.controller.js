import { returnService } from "../services/return.service.js";
import { asyncHandler } from "../utils/async-handler.util.js";
import { customerReturnSchema, supplierReturnSchema } from "../validators/index.js";

export const customerReturn = asyncHandler(async (req, res) => {
  const parsed = customerReturnSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.status(201).json(await returnService.processCustomerReturn(parsed.data));
});

export const supplierReturn = asyncHandler(async (req, res) => {
  const parsed = supplierReturnSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.status(201).json(await returnService.processSupplierReturn(parsed.data));
});
