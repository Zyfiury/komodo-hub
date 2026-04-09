"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [, rerender] = useState(0);

  const current = theme === "system" ? resolvedTheme : theme;
  if (!current) {
    // next-themes hydrates on client; keep a stable placeholder until then.
    return (
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white"
        aria-label="Toggle theme"
        onClick={() => rerender((n) => n + 1)}
      />
    );
  }
  const next = current === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white/60 px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm backdrop-blur hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-900"
    >
      {current === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{current === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}

