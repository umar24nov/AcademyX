"use client";

import { useEffect, useRef, useState } from "react";
import { getStoredUser } from "@/lib/api";
import type { UserSession } from "@/lib/types";

/**
 * Reads the current user session from localStorage only after mount, so SSR
 * and the first client render both see `null` (no hydration mismatch). Pages
 * should render a loading/fallback state until `user` becomes available.
 */
export function useStoredUser(): UserSession | null {
  const [user, setUser] = useState<UserSession | null>(null);
  useEffect(() => {
    setUser(getStoredUser());
  }, []);
  return user;
}

/**
 * Loads live data from the backend API once on mount. While the fetch is in
 * flight (or if the backend is unreachable), the provided mock fallback is
 * used so every page renders identically in demo mode.
 */
export function useLive<T>(fetcher: () => Promise<T>, fallback: T): T {
  const [data, setData] = useState<T>(fallback);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        // keep the mock fallback when the API is unavailable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
