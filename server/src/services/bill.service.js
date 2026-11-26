import { categoryRepository } from "../repositories/catalog.repository.js";
import { extractBillItems } from "./domain/ai-bill.service.js";

export const billService = {
  async extractAndEnrich(filePath, mimeType) {
    const items = await extractBillItems(filePath, mimeType);
    const categories = await categoryRepository.findAllPlain();
    return items.map((item) => {
      const cat = categories.find(
        (c) => c.name.toLowerCase() === item.categorySuggestion?.toLowerCase()
      );
      return {
        ...item,
        categoryId: cat?.id ?? categories[0]?.id,
        categoryName: cat?.name ?? item.categorySuggestion,
      };
    });
  },
};
