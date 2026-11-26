import { prisma } from "../database/prisma.client.js";

export const batchRepository = {
  findInStock(categoryId) {
    return prisma.medicineBatch.findMany({
      where: {
        quantity: { gt: 0 },
        ...(categoryId ? { medicine: { categoryId } } : {}),
      },
      include: { medicine: { include: { category: true } } },
      orderBy: [{ medicine: { name: "asc" } }, { expiryDate: "asc" }],
    });
  },
};

export const stockReceiptRepository = {
  create(source, tx) {
    const db = tx ?? prisma;
    return db.stockReceipt.create({ data: { source } });
  },
};
