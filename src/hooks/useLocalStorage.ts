"use client";
import React from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(initialValue);

  React.useEffect(() => {
    try {
      const item = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      setValue(item ? (JSON.parse(item) as T) : initialValue);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = React.useCallback(
    (next: T) => {
      setValue(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(next));
      }
    },
    [key]
  );

  return [value, set] as const;
}

