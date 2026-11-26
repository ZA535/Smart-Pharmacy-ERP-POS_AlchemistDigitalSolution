import { prisma } from "../database/prisma.client.js";
import { StockReceiptSource } from "../enums/index.js";
import { medicineRepository } from "../repositories/catalog.repository.js";
import {
  batchRepository,
  stockReceiptRepository,
} from "../repositories/inventory.repository.js";
import { addStockAndReconcilePO } from "./domain/stock-reconciliation.service.js";

export const inventoryService = {
  async addManualStock(dto) {
    await prisma.$transaction(async (tx) => {
      await addStockAndReconcilePO(
        [
          {
            medicineId: dto.medicineId,
            batchNumber: dto.batchNumber,
            expiryDate: new Date(dto.expiryDate),
            quantity: dto.quantity,
            purchasePrice: dto.purchasePrice,
            mrp: dto.mrp,
          },
        ],
        tx
      );
      await stockReceiptRepository.create(StockReceiptSource.MANUAL, tx);
    });
    return { ok: true };
  },

  async confirmBillItems(items) {
    await prisma.$transaction(async (tx) => {
      const stockLines = [];
      for (const item of items) {
        let medicineId = item.medicineId;
        if (!medicineId) {
          const existing = await medicineRepository.findByNameAndCategory(
            item.medicineName,
            item.categoryId,
            tx
          );
          if (existing) medicineId = existing.id;
          else {
            const created = await medicineRepository.createWithTx(
              { name: item.medicineName, categoryId: item.categoryId },
              tx
            );
            medicineId = created.id;
          }
        }
        stockLines.push({
          medicineId,
          batchNumber: item.batchNumber,
          expiryDate: new Date(item.expiryDate),
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          mrp: item.mrp,
        });
      }
      await addStockAndReconcilePO(stockLines, tx);
      await stockReceiptRepository.create(StockReceiptSource.AI_BILL, tx);
    });
    return { ok: true };
  },

  listBatches(categoryId) {
    return batchRepository.findInStock(categoryId);
  },
};
