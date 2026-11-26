import { medicineRepository } from "../repositories/catalog.repository.js";
import { AppError } from "../errors/AppError.js";

export const medicineService = {
  async list(query) {
    const categoryId = query.categoryId;
    const q = query.q?.trim();
    const medicines = await medicineRepository.findMany({ categoryId, q });
    return medicines.map((m) => ({
      ...m,
      totalStock: m.batches.reduce((a, b) => a + b.quantity, 0),
    }));
  },
  async getById(id) {
    const medicine = await medicineRepository.findById(id);
    if (!medicine) throw new AppError("Not found", 404);
    return medicine;
  },
  create(data) {
    return medicineRepository.create(data);
  },
  update(id, data) {
    return medicineRepository.update(id, data);
  },
};
