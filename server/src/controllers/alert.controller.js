import { alertService } from "../services/alert.service.js";
import { asyncHandler } from "../utils/async-handler.util.js";
import { alertSettingsSchema } from "../validators/index.js";

export const listAlerts = asyncHandler(async (_req, res) => {
  res.json(await alertService.getAlerts());
});

export const getAlertSettings = asyncHandler(async (_req, res) => {
  res.json(await alertService.getSettings());
});

export const updateAlertSettings = asyncHandler(async (req, res) => {
  const parsed = alertSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.json(await alertService.updateSettings(parsed.data.globalExpiryLeadDays));
});
