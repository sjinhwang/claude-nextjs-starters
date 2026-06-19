"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // localStorage 접근 불가 환경(SSR, 시크릿 모드 등) 무시
    }
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const newValue =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch {
      // 쓰기 실패 무시
    }
  };

  return [storedValue, setValue];
}
