"use client";

import { useEffect, useRef, useState } from "react";

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
