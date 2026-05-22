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
        "relative w-full min-w-0 max-w-full bg-gradient-to-r from-brand-primary-50 dark:from-brand-primary-900/20 to-brand-primary-100 dark:to-brand-primary-900/30 border border-brand-primary-200 dark:border-brand-primary-800 rounded-lg",
        isCompact ? "p-4 pr-12" : "p-4 pr-12 sm:p-6 sm:pr-14",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 h-8 w-8 sm:top-4 sm:right-4"
        aria-label="Dismiss banner"
      >
        <X className="w-5 h-5" />
      </Button>
      <div
        className={cn(
          "flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
          isCompact && "sm:pr-0"
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4",
            isCompact && "sm:gap-4"
          )}
        >
          <div
            className={cn(
              "bg-brand-primary-200 dark:bg-brand-primary-800/50 rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0",
              isCompact ? "w-14 h-14 sm:w-16 sm:h-16" : "w-16 h-16 sm:w-24 sm:h-24"
            )}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
            <span
              className={cn(
                "font-bold text-brand-primary-700 dark:text-brand-primary-300 relative z-10",
                isCompact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
              )}
            >
              %
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2
              className={cn(
                "font-bold text-gray-900 dark:text-gray-100 break-words",
                isCompact ? "text-base mb-1 sm:text-lg" : "text-lg mb-1 sm:text-xl sm:mb-2"
              )}
            >
              {title}
            </h2>
            <p
              className={cn(
                "text-gray-700 dark:text-gray-300 text-sm sm:text-base",
                isCompact && "text-sm"
              )}
            >
              {description}
            </p>
          </div>
        </div>
        {!isCompact && (
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <div className="w-20 h-20 bg-brand-primary-200 dark:bg-brand-primary-800/50 rounded-lg flex items-center justify-center relative overflow-hidden sm:w-24 sm:h-24">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
              <span className="text-3xl sm:text-4xl font-bold text-brand-primary-700 dark:text-brand-primary-300 relative z-10">
                %
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-hidden tabIndex={-1}>
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
