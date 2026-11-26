import { prisma } from "../../database/prisma.client.js";
import { POStatus } from "../../enums/index.js";
import { toNum } from "../../utils/numbers.util.js";
import { computeAlerts } from "./alert-compute.service.js";

export async function getDashboardMetrics() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todaySales, monthSales, pendingPO, batches] = await Promise.all([
    prisma.sale.findMany({
      where: { createdAt: { gte: startOfDay } },
      include: { items: { include: { batch: true } } },
    }),
    prisma.sale.findMany({
      where: { createdAt: { gte: startOfMonth } },
      include: { items: { include: { batch: true } } },
    }),
    prisma.purchaseOrder.count({
      where: { status: { in: [POStatus.ORDERED, POStatus.PARTIAL] } },
    }),
    prisma.medicineBatch.findMany({ where: { quantity: { gt: 0 } } }),
  ]);

  const customerReturnsMonth = await prisma.customerReturn.findMany({
    where: { createdAt: { gte: startOfMonth } },
  });
  const supplierReturnsMonth = await prisma.supplierReturn.findMany({
    where: { createdAt: { gte: startOfMonth } },
  });

  function salesMetrics(sales) {
    let revenue = 0;
    let cogs = 0;
    for (const s of sales) {
      revenue += toNum(s.total);
      for (const item of s.items) {
        cogs += toNum(item.batch.purchasePrice) * item.quantity;
      }
    }
    return { revenue, cogs, profit: revenue - cogs };
  }

  const today = salesMetrics(todaySales);
  const month = salesMetrics(monthSales);
  const returnCredits = customerReturnsMonth.reduce(
    (a, r) => a + toNum(r.creditAmount),
    0
  );
  const returnDebits = supplierReturnsMonth.reduce(
    (a, r) => a + toNum(r.debitAmount),
    0
  );
  const stockValuation = batches.reduce(
    (a, b) => a + toNum(b.purchasePrice) * b.quantity,
    0
  );

  const alerts = await computeAlerts();

  return {
    todayRevenue: today.revenue,
    todayProfit: today.profit,
    monthRevenue: month.revenue,
    monthProfit: month.profit - returnCredits + returnDebits,
    stockValuation,
    pendingPOCount: pendingPO,
    alertSummary: {
      expired: alerts.expired.length,
      expiringSoon: alerts.expiringSoon.length,
      lowStock: alerts.lowStock.length,
    },
  };
}
