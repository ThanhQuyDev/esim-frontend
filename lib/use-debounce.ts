import { useState, useEffect } from "react";

/**
 * Custom debounce hook - delays updating the value until after
 * the specified delay has passed since the last change.
 * When the value changes, React Query will automatically cancel
 * the previous in-flight request via AbortController.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
