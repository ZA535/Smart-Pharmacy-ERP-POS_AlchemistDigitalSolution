import { POItemStatus, POStatus } from "../../enums/index.js";
import { prisma } from "../../database/prisma.client.js";

/** Add batches and match against open purchase order lines. */
export async function addStockAndReconcilePO(lines, tx) {
  const db = tx ?? prisma;

  for (const line of lines) {
    await db.medicineBatch.upsert({
      where: {
        medicineId_batchNumber: {
          medicineId: line.medicineId,
          batchNumber: line.batchNumber,
        },
      },
      create: {
        medicineId: line.medicineId,
        batchNumber: line.batchNumber,
        expiryDate: line.expiryDate,
        quantity: line.quantity,
        purchasePrice: line.purchasePrice,
        mrp: line.mrp,
      },
      update: {
        quantity: { increment: line.quantity },
        purchasePrice: line.purchasePrice,
        mrp: line.mrp,
        expiryDate: line.expiryDate,
      },
    });

    const openItems = await db.purchaseOrderItem.findMany({
      where: {
        medicineId: line.medicineId,
        status: { in: [POItemStatus.ORDERED, POItemStatus.PARTIAL] },
        purchaseOrder: {
          status: { in: [POStatus.ORDERED, POStatus.PARTIAL] },
        },
      },
      include: { purchaseOrder: true },
      orderBy: { purchaseOrder: { orderedAt: "asc" } },
    });

    let qtyToMatch = line.quantity;
    const touchedOrders = new Set();

    for (const item of openItems) {
      if (qtyToMatch <= 0) break;
      const need = item.quantityOrdered - item.quantityReceived;
      if (need <= 0) continue;

      const add = Math.min(need, qtyToMatch);
      const newReceived = item.quantityReceived + add;
      const itemStatus =
        newReceived >= item.quantityOrdered
          ? POItemStatus.RECEIVED
          : POItemStatus.PARTIAL;

      await db.purchaseOrderItem.update({
        where: { id: item.id },
        data: {
          quantityReceived: newReceived,
          status: itemStatus,
          lastReceivedAt: new Date(),
        },
      });

      touchedOrders.add(item.purchaseOrderId);
      qtyToMatch -= add;
    }

    for (const poId of touchedOrders) {
      const poItems = await db.purchaseOrderItem.findMany({
        where: { purchaseOrderId: poId },
      });
      const allReceived = poItems.every((i) => i.status === POItemStatus.RECEIVED);
      const anyReceived = poItems.some((i) => i.quantityReceived > 0);
      let status = POStatus.ORDERED;
      if (allReceived) status = POStatus.RECEIVED;
      else if (anyReceived) status = POStatus.PARTIAL;

      await db.purchaseOrder.update({
        where: { id: poId },
        data: {
          status,
          receivedAt: allReceived ? new Date() : undefined,
        },
      });
    }
  }
}
