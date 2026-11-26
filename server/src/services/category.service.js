import { AppError } from "../errors/AppError.js";
import { categoryRepository } from "../repositories/catalog.repository.js";

export const categoryService = {
  list() {
    return categoryRepository.findAll();
  },
  async create(name) {
    try {
      return await categoryRepository.create(name);
    } catch {
      throw new AppError("Category already exists", 409);
    }
  },
  update(id, name) {
    return categoryRepository.update(id, name);
  },
};
