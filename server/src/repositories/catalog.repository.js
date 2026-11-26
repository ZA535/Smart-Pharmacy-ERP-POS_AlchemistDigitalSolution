import { prisma } from "../database/prisma.client.js";

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { medicines: true } } },
    });
  },
  create(name) {
    return prisma.category.create({ data: { name } });
  },
  update(id, name) {
    return prisma.category.update({
      where: { id },
      data: { name },
    });
  },
  findAllPlain() {
    return prisma.category.findMany();
  },
};

export const medicineRepository = {
  findMany(filters = {}) {
    const { categoryId, q } = filters;
    return prisma.medicine.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { genericFormula: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        batches: {
          where: { quantity: { gt: 0 } },
          orderBy: { expiryDate: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  },
  findById(id) {
    return prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
        batches: { orderBy: { expiryDate: "asc" } },
      },
    });
  },
  create(data) {
    return prisma.medicine.create({ data });
  },
  update(id, data) {
    return prisma.medicine.update({ where: { id }, data });
  },
  findByNameAndCategory(name, categoryId, tx) {
    const db = tx ?? prisma;
    return db.medicine.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        categoryId,
      },
    });
  },
  createWithTx(data, tx) {
    return tx.medicine.create({ data });
  },
};
