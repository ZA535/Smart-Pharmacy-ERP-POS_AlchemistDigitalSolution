import { prisma } from "../database/prisma.client.js";
import { AppError } from "../errors/AppError.js";
import { saleRepository } from "../repositories/sales.repository.js";
import { roundMoney, toNum } from "../utils/numbers.util.js";
import {
  nextCustomerReturnNumber,
  nextSupplierReturnNumber,
} from "./domain/document-number.service.js";

export const returnService = {
  async processCustomerReturn({ invoiceNumber, items }) {
    const sale = await saleRepository.findByInvoiceWithItems(invoiceNumber);
    if (!sale) throw new AppError("Invoice not found", 404);

    let credit = 0;
    const returnNumber = await nextCustomerReturnNumber();

    try {
      return await prisma.$transaction(async (tx) => {
        for (const row of items) {
          const saleItem = sale.items.find((i) => i.id === row.saleItemId);
          if (!saleItem) throw new Error("Invalid sale line");
          const maxReturn = saleItem.quantity - saleItem.returnedQty;
          if (row.quantity > maxReturn) {
            throw new Error(
              `Return qty exceeds purchased for ${saleItem.medicineName}`
            );
          }
          await tx.medicineBatch.update({
            where: { id: saleItem.batchId },
            data: { quantity: { increment: row.quantity } },
          });
          await tx.saleItem.update({
            where: { id: saleItem.id },
            data: { returnedQty: { increment: row.quantity } },
          });
          credit += toNum(saleItem.unitPrice) * row.quantity;
        }

        return tx.customerReturn.create({
          data: {
            returnNumber,
            saleId: sale.id,
            creditAmount: roundMoney(credit),
            items: {
              create: items.map((i) => ({
                saleItemId: i.saleItemId,
                quantity: i.quantity,
              })),
            },
          },
          include: { items: true, sale: true },
        });
      });
    } catch (e) {
      throw new AppError(e instanceof Error ? e.message : "Return failed", 400);
    }
  },

  async processSupplierReturn({ supplierId, reason, items }) {
    const returnNumber = await nextSupplierReturnNumber();
    let debit = 0;

    try {
      return await prisma.$transaction(async (tx) => {
        const lineData = [];
        for (const row of items) {
          const batch = await tx.medicineBatch.findUnique({
            where: { id: row.batchId },
          });
          if (!batch || batch.quantity < row.quantity) {
            throw new Error("Insufficient batch qty for supplier return");
          }
          await tx.medicineBatch.update({
            where: { id: row.batchId },
            data: { quantity: { decrement: row.quantity } },
          });
          const unitCost = toNum(batch.purchasePrice);
          debit += unitCost * row.quantity;
          lineData.push({
            batchId: row.batchId,
            quantity: row.quantity,
            unitCost,
          });
        }

        return tx.supplierReturn.create({
          data: {
            returnNumber,
            supplierId,
            reason,
            debitAmount: roundMoney(debit),
            items: { create: lineData },
          },
          include: {
            items: { include: { batch: { include: { medicine: true } } } },
          },
        });
      });
    } catch (e) {
      throw new AppError(
        e instanceof Error ? e.message : "Supplier return failed",
        400
      );
    }
  },
};
