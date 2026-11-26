import { getDashboardMetrics } from "./domain/dashboard-metrics.service.js";

export const dashboardService = {
  getStats() {
    return getDashboardMetrics();
  },
};
