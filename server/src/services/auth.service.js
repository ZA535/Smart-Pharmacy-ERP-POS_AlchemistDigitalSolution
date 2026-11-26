import bcrypt from "bcryptjs";
import { AppError } from "../errors/AppError.js";
import { signToken } from "../middleware/auth.middleware.js";
import { userRepository } from "../repositories/user.repository.js";

export async function loginUser({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Invalid email or password", 401);
  }
  const publicUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return { token: signToken(publicUser), user: publicUser };
}
