import { prisma } from "../../database/prisma.client.js";

export async function nextInvoiceNumber() {
  const count = await prisma.sale.count();
  const d = new Date();
  const prefix = `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${prefix}-${String(count + 1).padStart(5, "0")}`;
}

export async function nextPONumber() {
  const count = await prisma.purchaseOrder.count();
  return `PO-${String(count + 1).padStart(6, "0")}`;
}

export async function nextCustomerReturnNumber() {
  const count = await prisma.customerReturn.count();
  return `CR-${String(count + 1).padStart(6, "0")}`;
}

export async function nextSupplierReturnNumber() {
  const count = await prisma.supplierReturn.count();
  return `SR-${String(count + 1).padStart(6, "0")}`;
}
