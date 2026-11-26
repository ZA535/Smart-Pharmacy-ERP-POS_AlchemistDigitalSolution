import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();
const CATEGORIES = [
  "Tablets",
  "Capsules",
  "Syrups",
  "Injections",
  "Drops",
  "Ointments",
  "Surgical/Medical Devices",
  "Nutraceuticals",
];
async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const cashierHash = await bcrypt.hash("cashier123", 10);
  await prisma.user.upsert({
    where: { email: "admin@pharmacy.local" },
    update: {},
    create: {
      email: "admin@pharmacy.local",
      passwordHash: adminHash,
      name: "Admin Pharmacist",
      role: Role.ADMIN,
    },
  });
  await prisma.user.upsert({
    where: { email: "cashier@pharmacy.local" },
    update: {},
    create: {
      email: "cashier@pharmacy.local",
      passwordHash: cashierHash,
      name: "Sales Counter",
      role: Role.CASHIER,
    },
  });
  for (const name of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  await prisma.alertSettings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", globalExpiryLeadDays: 30 },
  });
  const supplier = await prisma.supplier.upsert({
    where: { id: "seed-supplier" },
    update: {},
    create: {
      id: "seed-supplier",
      name: "MedSupply Distributors",
      phone: "+1-555-0100",
      email: "orders@medsupply.example",
    },
  });
  const tablets = await prisma.category.findUniqueOrThrow({
    where: { name: "Tablets" },
  });
  const paracetamol = await prisma.medicine.upsert({
    where: {
      name_categoryId: { name: "Paracetamol 500mg", categoryId: tablets.id },
    },
    update: {},
    create: {
      name: "Paracetamol 500mg",
      genericFormula: "Paracetamol",
      categoryId: tablets.id,
      lowStockThreshold: 20,
    },
  });
  const exp = new Date();
  exp.setFullYear(exp.getFullYear() + 2);
  await prisma.medicineBatch.upsert({
    where: {
      medicineId_batchNumber: {
        medicineId: paracetamol.id,
        batchNumber: "SEED-001",
      },
    },
    update: {},
    create: {
      medicineId: paracetamol.id,
      batchNumber: "SEED-001",
      expiryDate: exp,
      quantity: 200,
      purchasePrice: 12,
      mrp: 18,
    },
  });
  console.log("Seed complete.");
  console.log("Admin: admin@pharmacy.local / admin123");
  console.log("Cashier: cashier@pharmacy.local / cashier123");
  console.log("Supplier:", supplier.name);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
