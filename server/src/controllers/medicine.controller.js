import { medicineService } from "../services/medicine.service.js";
import { asyncHandler } from "../utils/async-handler.util.js";
import { createMedicineSchema, updateMedicineSchema } from "../validators/index.js";

export const listMedicines = asyncHandler(async (req, res) => {
  res.json(await medicineService.list(req.query));
});

export const getMedicine = asyncHandler(async (req, res) => {
  res.json(await medicineService.getById(String(req.params.id)));
});

export const createMedicine = asyncHandler(async (req, res) => {
  const parsed = createMedicineSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.status(201).json(await medicineService.create(parsed.data));
});

export const updateMedicine = asyncHandler(async (req, res) => {
  const parsed = updateMedicineSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.json(await medicineService.update(String(req.params.id), parsed.data));
});
