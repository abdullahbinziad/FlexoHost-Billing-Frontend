"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export type DarkModeToggleProps = {
  className?: string;
  iconClassName?: string;
};

export function DarkModeToggle({ className, iconClassName }: DarkModeToggleProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant={className ? "ghost" : "outline"}
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className={cn("w-5 h-5", iconClassName)} />
      ) : (
        <Moon className={cn("w-5 h-5", iconClassName)} />
      )}
    </Button>
  );
}
