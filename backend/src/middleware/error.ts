import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

const GENERIC_500 = "Internal server error";

function logError(req: Request, err: unknown) {
  const detail =
    err instanceof Error ? { message: err.message, stack: err.stack } : { error: String(err) };

  console.error(
    JSON.stringify({
      level: "error",
      timestamp: new Date().toISOString(),
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      ...detail,
    })
  );
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound("Route not found"));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) logError(req, err);
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(err.details !== undefined && { details: err.details }),
    });
  }

  if ((err as { type?: string } | undefined)?.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      code: "BAD_REQUEST",
      message: "Invalid JSON body",
    });
  }

  logError(req, err);

  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: GENERIC_500,
  });
}
