import { posService } from "../services/pos.service.js";
import { asyncHandler } from "../utils/async-handler.util.js";
import { checkoutSchema } from "../validators/index.js";

export const checkout = asyncHandler(async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const sale = await posService.checkout({
    ...parsed.data,
    cashierId: req.user.id,
  });
  res.status(201).json(sale);
});

export const getSale = asyncHandler(async (req, res) => {
  res.json(await posService.getSaleByInvoice(String(req.params.invoiceNumber)));
});
