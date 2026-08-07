import { z } from "zod";

const HTTP_URL_RE = /^https?:\/\//i;

// Media/attachment URLs must be absolute http(s) URLs. Invalid input is
// rejected, never silently sanitized.
export const httpUrl = z
  .string()
  .url()
  .max(2048)
  .refine((url) => HTTP_URL_RE.test(url), "URL must use the http or https protocol");

export const optionalHttpUrl = httpUrl.optional();

export const titleString = z.string().min(2).max(200);
export const optionalLongText = z.string().max(5000).optional();
export const emailString = z.string().email().max(254);
