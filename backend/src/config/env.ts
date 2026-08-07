import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  // Default to production so dev-only behaviors (e.g. returning the
  // forgot-password reset token in the API response) are never exposed
  // on a host that forgets to set NODE_ENV explicitly.
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  REFRESH_TOKEN_ROTATION: z.string().default("true").transform((v) => v === "true"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  RATE_LIMIT_PUBLIC_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_PUBLIC_MAX: z.coerce.number().default(100),
  RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(20),
  RATE_LIMIT_ACCOUNT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_ACCOUNT_MAX: z.coerce.number().default(10),
  RATE_LIMIT_AUTHENTICATED_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_AUTHENTICATED_MAX: z.coerce.number().default(300),
  RATE_LIMIT_MAX_BACKOFF_MS: z.coerce.number().default(24 * 60 * 60 * 1000),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  HMS_APP_ID: z.string().optional(),
  HMS_APP_ACCESS_KEY: z.string().optional(),
  HMS_APP_SECRET: z.string().optional(),
  HMS_TEMPLATE_ID: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("AcademyX <no-reply@academyx.app>"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
