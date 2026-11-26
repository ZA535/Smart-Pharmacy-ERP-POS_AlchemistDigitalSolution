import { prisma } from "../database/prisma.client.js";
import { AppError } from "../errors/AppError.js";
import { saleRepository } from "../repositories/sales.repository.js";
import { roundMoney, toNum } from "../utils/numbers.util.js";
import { allocateFefo } from "./domain/fefo.service.js";
import { nextInvoiceNumber } from "./domain/document-number.service.js";

export const posService = {
  async checkout({ lines, taxAmount, discountAmount, cashierId }) {
    const invoiceNumber = await nextInvoiceNumber();

    try {
      return await prisma.$transaction(async (tx) => {
        const saleItems = [];

        for (const line of lines) {
          const medicine = await tx.medicine.findUnique({
            where: { id: line.medicineId },
          });
          if (!medicine) {
            throw new Error(`Medicine ${line.medicineId} not found`);
          }

          const allocations = await allocateFefo(
            line.medicineId,
            line.quantity,
            new Date(),
            tx
          );

          for (const alloc of allocations) {
            const batch = await tx.medicineBatch.findUniqueOrThrow({
              where: { id: alloc.batchId },
            });
            if (batch.expiryDate <= new Date()) {
              throw new Error("Expired batch blocked from sale");
            }
            await tx.medicineBatch.update({
              where: { id: alloc.batchId },
              data: { quantity: { decrement: alloc.quantity } },
            });
            const unitPrice = toNum(batch.mrp);
            saleItems.push({
              batchId: alloc.batchId,
              medicineName: medicine.name,
              batchNumber: batch.batchNumber,
              quantity: alloc.quantity,
              unitPrice,
              lineTotal: roundMoney(unitPrice * alloc.quantity),
            });
          }
        }

        const subtotal = roundMoney(saleItems.reduce((a, i) => a + i.lineTotal, 0));
        const total = roundMoney(subtotal + taxAmount - discountAmount);

        return tx.sale.create({
          data: {
            invoiceNumber,
            cashierId,
            subtotal,
            taxAmount,
            discountAmount,
            total,
            items: { create: saleItems },
          },
          include: {
            items: true,
            cashier: { select: { name: true, email: true } },
          },
        });
      });
    } catch (e) {
      throw new AppError(e instanceof Error ? e.message : "Checkout failed", 400);
    }
  },

  async getSaleByInvoice(invoiceNumber) {
    const sale = await saleRepository.findByInvoice(invoiceNumber);
    if (!sale) throw new AppError("Invoice not found", 404);
    return sale;
  },
};
