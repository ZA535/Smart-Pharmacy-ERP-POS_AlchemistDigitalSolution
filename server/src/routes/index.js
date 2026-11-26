import { Router } from "express";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import medicineRoutes from "./medicine.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import purchaseOrderRoutes from "./purchase-order.routes.js";
import supplierRoutes from "./supplier.routes.js";
import billRoutes from "./bill.routes.js";
import posRoutes from "./pos.routes.js";
import returnRoutes from "./return.routes.js";
import alertRoutes from "./alert.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

/** Central API router — mounts domain route modules under `/api`. */
export function registerApiRoutes(app) {
  const api = Router();

  api.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "smart-pharmacy-erp" });
  });

  api.use("/auth", authRoutes);
  api.use("/categories", categoryRoutes);
  api.use("/medicines", medicineRoutes);
  api.use("/inventory", inventoryRoutes);
  api.use("/purchase-orders", purchaseOrderRoutes);
  api.use("/suppliers", supplierRoutes);
  api.use("/bills", billRoutes);
  api.use("/pos", posRoutes);
  api.use("/returns", returnRoutes);
  api.use("/alerts", alertRoutes);
  api.use("/dashboard", dashboardRoutes);

  app.use("/api", api);
}
