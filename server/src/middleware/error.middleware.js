import { AppError } from "../errors/AppError.js";

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
