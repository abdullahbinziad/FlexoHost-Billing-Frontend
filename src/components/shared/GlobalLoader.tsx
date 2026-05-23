"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
}

export function GlobalLoader({
  className,
  size = "lg",
  text,
  fullScreen = false
}: GlobalLoaderProps) {

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
    xl: "w-16 h-16"
  };

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative">
        <div className={cn(
          "absolute inset-0 rounded-full border-t-2 border-primary/30 animate-[spin_3s_linear_infinite]",
          sizeClasses[size]
        )}></div>
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      </div>
      {text && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
