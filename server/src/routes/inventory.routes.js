import { Router } from "express";
import * as inventoryController from "../controllers/inventory.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.post("/manual", requireAdmin, inventoryController.addManualStock);
router.post("/confirm-bill", requireAdmin, inventoryController.confirmBill);
router.get("/batches", inventoryController.listBatches);

export default router;
