import { supplierRepository } from "../repositories/order.repository.js";

export const supplierService = {
  list() {
    return supplierRepository.findAll();
  },
  create(data) {
    return supplierRepository.create(data);
  },
};
