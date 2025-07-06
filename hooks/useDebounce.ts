"use client"
import { useEffect, useState } from "react";

/**
 * Custom hook for debouncing a value
 * @param initialValue The initial value to debounce
 * @param delay The delay in milliseconds before the value updates
 * @returns A tuple containing the debounced value and a setter function
 */
export function useDebounce<T>(initialValue: T, delay: number): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return [debouncedValue, setValue];
}

export default useDebounce;