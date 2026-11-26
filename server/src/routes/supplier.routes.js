import { Router } from "express";
import * as supplierController from "../controllers/supplier.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/", supplierController.listSuppliers);
router.post("/", requireAdmin, supplierController.createSupplier);

export default router;
