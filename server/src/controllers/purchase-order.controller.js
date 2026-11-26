import { purchaseOrderService } from "../services/purchase-order.service.js";
import { asyncHandler } from "../utils/async-handler.util.js";
import { createPOSchema, poFromAlertSchema } from "../validators/index.js";

export const listPurchaseOrders = asyncHandler(async (req, res) => {
  res.json(await purchaseOrderService.list(req.query.status));
});

export const createPurchaseOrder = asyncHandler(async (req, res) => {
  const parsed = createPOSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.status(201).json(await purchaseOrderService.create(parsed.data));
});

export const createPOFromAlert = asyncHandler(async (req, res) => {
  const parsed = poFromAlertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.status(201).json(await purchaseOrderService.createFromAlerts(parsed.data));
});
