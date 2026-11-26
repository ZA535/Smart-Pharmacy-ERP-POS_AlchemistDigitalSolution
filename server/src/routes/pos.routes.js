import { Router } from "express";
import * as posController from "../controllers/pos.controller.js";
import { authenticate, requireCashierOrAdmin } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate, requireCashierOrAdmin);

router.post("/checkout", posController.checkout);
router.get("/sales/:invoiceNumber", posController.getSale);

export default router;
