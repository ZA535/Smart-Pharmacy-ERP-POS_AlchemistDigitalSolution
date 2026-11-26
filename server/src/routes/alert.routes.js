import { Router } from "express";
import * as alertController from "../controllers/alert.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/", alertController.listAlerts);
router.get("/settings", requireAdmin, alertController.getAlertSettings);
router.patch("/settings", requireAdmin, alertController.updateAlertSettings);

export default router;
