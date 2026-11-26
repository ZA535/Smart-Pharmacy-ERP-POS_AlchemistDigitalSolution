import { prisma } from "../database/prisma.client.js";

export const supplierRepository = {
  findAll() {
    return prisma.supplier.findMany({ orderBy: { name: "asc" } });
  },
  create(data) {
    return prisma.supplier.create({ data });
  },
};

export const purchaseOrderRepository = {
  findMany(status) {
    return prisma.purchaseOrder.findMany({
      where: status ? { status } : undefined,
      include: {
        supplier: true,
        items: { include: { medicine: { include: { category: true } } } },
      },
      orderBy: { orderedAt: "desc" },
    });
  },
  create(data) {
    return prisma.purchaseOrder.create(data);
  },
  count() {
    return prisma.purchaseOrder.count();
  },
};
