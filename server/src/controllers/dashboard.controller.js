import { dashboardService } from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/async-handler.util.js";

export const getDashboard = asyncHandler(async (_req, res) => {
  res.json(await dashboardService.getStats());
});
