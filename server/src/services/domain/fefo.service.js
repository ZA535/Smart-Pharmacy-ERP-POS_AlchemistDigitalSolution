import { prisma } from "../../database/prisma.client.js";

/** Allocate qty from earliest non-expired batches (FEFO). */
export async function allocateFefo(medicineId, qty, asOf = new Date(), tx) {
  const db = tx ?? prisma;
  const batches = await db.medicineBatch.findMany({
    where: {
      medicineId,
      quantity: { gt: 0 },
      expiryDate: { gt: asOf },
    },
    orderBy: { expiryDate: "asc" },
  });

  let remaining = qty;
  const allocations = [];

  for (const b of batches) {
    if (remaining <= 0) break;
    const take = Math.min(b.quantity, remaining);
    allocations.push({ batchId: b.id, quantity: take });
    remaining -= take;
  }

  if (remaining > 0) {
    throw new Error("Insufficient non-expired stock for this medicine");
  }
  return allocations;
}
