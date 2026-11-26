import { prisma } from "../database/prisma.client.js";

export const userRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },
};
