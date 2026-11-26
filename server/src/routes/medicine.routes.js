import { Router } from "express";
import * as medicineController from "../controllers/medicine.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/", medicineController.listMedicines);
router.get("/:id", medicineController.getMedicine);
router.post("/", requireAdmin, medicineController.createMedicine);
router.patch("/:id", requireAdmin, medicineController.updateMedicine);

export default router;
