import { inventoryService } from "../services/inventory.service.js";
import { asyncHandler } from "../utils/async-handler.util.js";
import { confirmBillSchema, manualStockSchema } from "../validators/index.js";

export const addManualStock = asyncHandler(async (req, res) => {
  const parsed = manualStockSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.status(201).json(await inventoryService.addManualStock(parsed.data));
});

export const confirmBill = asyncHandler(async (req, res) => {
  const parsed = confirmBillSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.status(201).json(await inventoryService.confirmBillItems(parsed.data.items));
});

export const listBatches = asyncHandler(async (req, res) => {
  res.json(await inventoryService.listBatches(req.query.categoryId));
});
