import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/", categoryController.listCategories);
router.post("/", requireAdmin, categoryController.createCategory);
router.patch("/:id", requireAdmin, categoryController.updateCategory);

export default router;
