import { Router } from "express";
import * as returnController from "../controllers/return.controller.js";
import {
  authenticate,
  requireAdmin,
  requireCashierOrAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.post("/customer", requireCashierOrAdmin, returnController.customerReturn);
router.post("/supplier", requireAdmin, returnController.supplierReturn);

export default router;
