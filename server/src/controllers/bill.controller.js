import { billService } from "../services/bill.service.js";
import { asyncHandler } from "../utils/async-handler.util.js";

export const extractBill = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "File required (JPG, PNG, PDF)" });
    return;
  }
  try {
    const items = await billService.extractAndEnrich(req.file.path, req.file.mimetype);
    res.json({ items });
  } finally {
    const fs = await import("fs");
    fs.unlink(req.file.path, () => {});
  }
});
