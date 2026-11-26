import { Router } from "express";
import * as billController from "../controllers/bill.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";
import { billUpload } from "../middleware/upload.middleware.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.post("/extract", billUpload.single("file"), billController.extractBill);

export default router;
