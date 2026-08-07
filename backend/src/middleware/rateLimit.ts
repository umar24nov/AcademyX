import { NextFunction, Request, RequestHandler, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

interface Bucket {
  count: number;
  resetAt: number;
}

interface BackoffState {
  blockUntil: number;
  strikes: number;
}

const buckets = new Map<string, Bucket>();
const backoffs = new Map<string, BackoffState>();

const MAX_BACKOFF_MS = Math.min(env.RATE_LIMIT_MAX_BACKOFF_MS, 7 * 24 * 60 * 60 * 1000);
const MAX_STRIKES = 10;

function cleanup() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
  for (const [key, state] of backoffs) {
    if (state.blockUntil < now) backoffs.delete(key);
  }
}

setInterval(cleanup, 5 * 60 * 1000).unref();

function checkBucket(key: string, windowMs: number, max: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (bucket.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: max - bucket.count };
}

function backoffBlockMs(windowMs: number, strikes: number): number {
  return Math.min(windowMs * 2 ** strikes, MAX_BACKOFF_MS);
}

export interface RateLimitOptions {
  key: string;
  windowMs?: number;
  max?: number;
  accountKey?: (req: Request) => string | null;
  accountWindowMs?: number;
  accountMax?: number;
  backoff?: boolean;
}

export function rateLimit(opts: RateLimitOptions): RequestHandler {
  const windowMs = opts.windowMs ?? env.RATE_LIMIT_PUBLIC_WINDOW_MS;
  const max = opts.max ?? env.RATE_LIMIT_PUBLIC_MAX;
  const accountWindowMs = opts.accountWindowMs ?? windowMs;
  const accountMax = opts.accountMax ?? max;

  return (req: Request, res: Response, next: NextFunction) => {
    const ipKey = `${opts.key}:ip:${req.ip ?? "unknown"}`;
    const ip = checkBucket(ipKey, windowMs, max);

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(ip.remaining));

    if (!ip.allowed) {
      return next(ApiError.tooManyRequests());
    }

    const accountId = opts.accountKey?.(req);
    if (accountId) {
      const backoffKey = `${opts.key}:bo:${accountId}`;

      if (opts.backoff) {
        const state = backoffs.get(backoffKey);
        if (state && state.blockUntil > Date.now()) {
          state.strikes = Math.min(state.strikes + 1, MAX_STRIKES);
          const nextBlockMs = backoffBlockMs(accountWindowMs, state.strikes);
          state.blockUntil = Date.now() + nextBlockMs;
          res.setHeader("Retry-After", String(Math.ceil(nextBlockMs / 1000)));
          return next(ApiError.tooManyRequests());
        }
      }

      const account = checkBucket(`${opts.key}:acct:${accountId}`, accountWindowMs, accountMax);
      if (!account.allowed) {
        if (opts.backoff) {
          const nextBlockMs = backoffBlockMs(accountWindowMs, 1);
          backoffs.set(backoffKey, { blockUntil: Date.now() + nextBlockMs, strikes: 1 });
          res.setHeader("Retry-After", String(Math.ceil(nextBlockMs / 1000)));
        }
        return next(ApiError.tooManyRequests());
      }
    }

    next();
  };
}

export function resetAccountBackoff(key: string, accountId: string) {
  backoffs.delete(`${key}:bo:${accountId}`);
}

// Public tier: moderate per-IP ceiling for endpoints that require no auth.
export const publicRateLimit = rateLimit({
  key: "public",
  windowMs: env.RATE_LIMIT_PUBLIC_WINDOW_MS,
  max: env.RATE_LIMIT_PUBLIC_MAX,
});

// Auth tier: strict per-IP + optional per-account with exponential backoff.
export function authRateLimit(options?: { accountKey?: RateLimitOptions["accountKey"]; backoff?: boolean }) {
  return rateLimit({
    key: "auth",
    windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
    max: env.RATE_LIMIT_AUTH_MAX,
    accountWindowMs: env.RATE_LIMIT_ACCOUNT_WINDOW_MS,
    accountMax: env.RATE_LIMIT_ACCOUNT_MAX,
    ...options,
  });
}

// Authenticated tier: looser per-IP for signed-in API traffic.
export const authenticatedRateLimit = rateLimit({
  key: "authed",
  windowMs: env.RATE_LIMIT_AUTHENTICATED_WINDOW_MS,
  max: env.RATE_LIMIT_AUTHENTICATED_MAX,
});
