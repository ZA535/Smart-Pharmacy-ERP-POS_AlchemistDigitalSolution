import { asyncHandler } from "../utils/async-handler.util.js";
import { loginSchema } from "../validators/index.js";
import { loginUser } from "../services/auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const result = await loginUser(parsed.data);
  res.json(result);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
