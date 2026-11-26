import { prisma } from "../../database/prisma.client.js";
import { AlertSettingsKey } from "../../enums/index.js";

export async function computeAlerts() {
  const settings = await prisma.alertSettings.findUnique({
    where: { id: AlertSettingsKey.GLOBAL },
  });
  const globalLead = settings?.globalExpiryLeadDays ?? 30;
  const now = new Date();

  const batches = await prisma.medicineBatch.findMany({
    where: { quantity: { gt: 0 } },
    include: { medicine: { include: { category: true } } },
  });

  const stockTotals = new Map();
  for (const b of batches) {
    stockTotals.set(b.medicineId, (stockTotals.get(b.medicineId) ?? 0) + b.quantity);
  }

  const expired = [];
  const expiringSoon = [];
  const lowStock = [];

  for (const b of batches) {
    const lead = b.medicine.expiryAlertDays ?? globalLead;
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() + lead);

    const row = {
      medicineId: b.medicineId,
      medicineName: b.medicine.name,
      category: b.medicine.category.name,
      batchId: b.id,
      batchNumber: b.batchNumber,
      remainingStock: b.quantity,
      expiryDate: b.expiryDate,
      daysRemaining: Math.ceil((b.expiryDate.getTime() - now.getTime()) / 86400000),
    };

    if (b.expiryDate <= now) expired.push(row);
    else if (b.expiryDate <= threshold) expiringSoon.push(row);
  }

  const medicines = await prisma.medicine.findMany({
    include: { category: true },
  });

  for (const m of medicines) {
    const total = stockTotals.get(m.id) ?? 0;
    if (total > 0 && total <= m.lowStockThreshold) {
      lowStock.push({
        medicineId: m.id,
        medicineName: m.name,
        category: m.category.name,
        remainingStock: total,
        threshold: m.lowStockThreshold,
      });
    }
  }

  return { expired, expiringSoon, lowStock, globalExpiryLeadDays: globalLead };
}
