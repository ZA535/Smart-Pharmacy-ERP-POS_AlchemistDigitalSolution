import { purchaseOrderRepository } from "../repositories/order.repository.js";
import { nextPONumber } from "./domain/document-number.service.js";

export const purchaseOrderService = {
  list(status) {
    return purchaseOrderRepository.findMany(status);
  },

  async create(dto) {
    const orderNumber = await nextPONumber();
    return purchaseOrderRepository.create({
      data: {
        orderNumber,
        supplierId: dto.supplierId,
        notes: dto.notes,
        items: {
          create: dto.items.map((i) => ({
            medicineId: i.medicineId,
            quantityOrdered: i.quantityOrdered,
          })),
        },
      },
      include: {
        supplier: true,
        items: { include: { medicine: true } },
      },
    });
  },

  async createFromAlerts({ supplierId, medicineIds }) {
    const orderNumber = await nextPONumber();
    return purchaseOrderRepository.create({
      data: {
        orderNumber,
        supplierId,
        items: {
          create: medicineIds.map((medicineId) => ({
            medicineId,
            quantityOrdered: 50,
          })),
        },
      },
      include: { supplier: true, items: { include: { medicine: true } } },
    });
  },
};
