import type { Role, UserSession } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  retried?: boolean;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("ax_refresh_token");
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;

  const body = await res.json();
  const accessToken = body?.data?.accessToken;
  const newRefresh = body?.data?.refreshToken;
  if (accessToken) localStorage.setItem("ax_access_token", accessToken);
  if (newRefresh) localStorage.setItem("ax_refresh_token", newRefresh);
  return accessToken ?? null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("ax_access_token");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  // One silent retry with a refreshed token on 401
  if (res.status === 401 && !options.retried && typeof window !== "undefined") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, { ...options, retried: true });
    }
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    let code: string | undefined;
    try {
      const body = await res.json();
      message = body.message ?? body.error ?? message;
      code = body.code;
    } catch {
      // ignore parse failure
    }
    throw new ApiError(res.status, message, code);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await res.json();
    // Unwrap the { success, data } envelope
    if (body && typeof body === "object" && "success" in body) {
      return body.data as T;
    }
    return body as T;
  }
  return {} as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function setTokens(access: string, refresh: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ax_access_token", access);
    localStorage.setItem("ax_refresh_token", refresh);
  }
}

export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ax_access_token");
    localStorage.removeItem("ax_refresh_token");
  }
}

export function getStoredUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ax_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.id && parsed.role) {
      return parsed as UserSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ax_session");
  }
  clearTokens();
}

export async function signOut(): Promise<void> {
  if (typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("ax_refresh_token");
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch {
        // best effort — the session is cleared regardless
      }
    }
  }
  clearSession();
}

export function dashboardPathFor(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/dashboard/super-admin";
    case "TEACHER":
      return "/dashboard/teacher";
    case "STUDENT":
      return "/dashboard/student";
    default:
      return "/dashboard/admin";
  }
}
