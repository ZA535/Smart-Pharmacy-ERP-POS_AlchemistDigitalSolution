import { Router } from "express";
import * as poController from "../controllers/purchase-order.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/", poController.listPurchaseOrders);
router.post("/", poController.createPurchaseOrder);
router.post("/from-alert", poController.createPOFromAlert);

export default router;
