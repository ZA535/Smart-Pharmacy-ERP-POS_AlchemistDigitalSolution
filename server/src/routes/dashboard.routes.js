import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/", dashboardController.getDashboard);

export default router;
