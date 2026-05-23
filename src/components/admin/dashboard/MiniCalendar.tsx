"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const { monthName, days, startOffset } = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startOffset = first.getDay();
    const daysInMonth = last.getDate();
    const monthName = first.toLocaleString("default", { month: "long" });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return { monthName, days, startOffset };
  }, [year, month]);

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground w-full max-w-[240px]">
      <div className="text-center font-semibold text-sm mb-3">
        {monthName} {year}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-muted-foreground font-medium py-0.5">
            {d}
          </div>
        ))}
        {Array.from({ length: startOffset }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((d) => (
          <div
            key={d}
            className={cn(
              "rounded p-1",
              d === today
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
