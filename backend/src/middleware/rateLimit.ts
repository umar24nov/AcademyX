import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

const buckets = new Map<string, { count: number; resetAt: number }>();

function cleanup() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

setInterval(cleanup, 5 * 60 * 1000).unref();

export function rateLimit(options?: { windowMs?: number; max?: number }) {
  const windowMs = options?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const max = options?.max ?? env.RATE_LIMIT_MAX;

  return (req: Request, _res: Response, next: NextFunction) => {
    const key = `${req.ip ?? "unknown"}:${req.originalUrl ?? req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= max) {
      return next(ApiError.tooManyRequests());
    }

    bucket.count += 1;
    return next();
  };
}

export const strictRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
