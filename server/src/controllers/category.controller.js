import { categoryService } from "../services/category.service.js";
import { asyncHandler } from "../utils/async-handler.util.js";
import { categoryNameSchema } from "../validators/index.js";

export const listCategories = asyncHandler(async (_req, res) => {
  res.json(await categoryService.list());
});

export const createCategory = asyncHandler(async (req, res) => {
  const parsed = categoryNameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid name" });
    return;
  }
  const cat = await categoryService.create(parsed.data.name);
  res.status(201).json(cat);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const parsed = categoryNameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid name" });
    return;
  }
  const cat = await categoryService.update(String(req.params.id), parsed.data.name);
  res.json(cat);
});
