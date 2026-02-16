"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromotionalBannerProps {
  title: string;
  description: string;
  variant?: "default" | "compact";
  className?: string;
}

export function PromotionalBanner({
  title,
  description,
  variant = "default",
  className,
}: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "relative bg-gradient-to-r from-brand-primary-50 dark:from-brand-primary-900/20 to-brand-primary-100 dark:to-brand-primary-900/30 border border-brand-primary-200 dark:border-brand-primary-800 rounded-lg",
        isCompact ? "p-4" : "p-6",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 h-8 w-8"
        aria-label="Dismiss banner"
      >
        <X className="w-5 h-5" />
      </Button>
      <div
        className={cn(
          "flex items-center justify-between gap-6",
          isCompact && "pr-8"
        )}
      >
        <div className={cn("flex items-center gap-4", isCompact && "flex-1")}>
          <div
            className={cn(
              "bg-brand-primary-200 dark:bg-brand-primary-800/50 rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0",
              isCompact ? "w-16 h-16" : "w-24 h-24"
            )}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
            <span
              className={cn(
                "font-bold text-brand-primary-700 dark:text-brand-primary-300 relative z-10",
                isCompact ? "text-3xl" : "text-4xl"
              )}
            >
              %
            </span>
          </div>
          <div className={isCompact ? "flex-1" : "flex-1"}>
            <h2
              className={cn(
                "font-bold text-gray-900 dark:text-gray-100",
                isCompact ? "text-lg mb-1" : "text-xl mb-2"
              )}
            >
              {title}
            </h2>
            <p
              className={cn(
                "text-gray-700 dark:text-gray-300",
                isCompact ? "text-sm" : ""
              )}
            >
              {description}
            </p>
          </div>
        </div>
        {!isCompact && (
          <div className="relative flex-shrink-0 flex items-center gap-2">
            <div className="w-24 h-24 bg-brand-primary-200 dark:bg-brand-primary-800/50 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
              <span className="text-4xl font-bold text-brand-primary-700 dark:text-brand-primary-300 relative z-10">
                %
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </div>
        )}
        {isCompact && (
          <div className="hidden md:block w-24 h-24 bg-brand-primary-100 dark:bg-brand-primary-900/20 rounded-lg opacity-50 relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.3)_50%,transparent_75%,transparent_100%)] bg-[length:15px_15px]"></div>
          </div>
        )}
      </div>
    </div>
  );
}
