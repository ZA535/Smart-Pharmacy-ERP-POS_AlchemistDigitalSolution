import { alertSettingsRepository } from "../repositories/sales.repository.js";
import { computeAlerts } from "./domain/alert-compute.service.js";

export const alertService = {
  getAlerts() {
    return computeAlerts();
  },
  getSettings() {
    return alertSettingsRepository.findGlobal();
  },
  updateSettings(globalExpiryLeadDays) {
    return alertSettingsRepository.upsertGlobal(globalExpiryLeadDays);
  },
};
