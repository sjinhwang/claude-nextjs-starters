"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const options = [
  { value: "system", icon: Monitor, label: "시스템" },
  { value: "light", icon: Sun, label: "라이트" },
  { value: "dark", icon: Moon, label: "다크" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function cycle() {
    const idx = options.findIndex((o) => o.value === theme);
    const next = options[(idx + 1) % options.length];
    setTheme(next.value);
  }

  const current = options.find((o) => o.value === theme) ?? options[0];
  const Icon = current.icon;

  return (
    <button
      onClick={cycle}
      aria-label={`현재 테마: ${current.label}. 클릭하여 전환`}
      className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
    >
      <Icon size={16} />
    </button>
  );
}
