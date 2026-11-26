import { prisma } from "../database/prisma.client.js";

export const saleRepository = {
  findByInvoice(invoiceNumber) {
    return prisma.sale.findUnique({
      where: { invoiceNumber },
      include: {
        items: { include: { batch: { include: { medicine: true } } } },
        cashier: { select: { name: true } },
      },
    });
  },
  findByInvoiceWithItems(invoiceNumber) {
    return prisma.sale.findUnique({
      where: { invoiceNumber },
      include: { items: true },
    });
  },
  count() {
    return prisma.sale.count();
  },
};

export const alertSettingsRepository = {
  findGlobal() {
    return prisma.alertSettings.findUnique({ where: { id: "global" } });
  },
  upsertGlobal(globalExpiryLeadDays) {
    return prisma.alertSettings.upsert({
      where: { id: "global" },
      create: { id: "global", globalExpiryLeadDays },
      update: { globalExpiryLeadDays },
    });
  },
};
