"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchMode = "find" | "ai-generate";

interface DomainSearchModeSelectorProps {
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
}

export function DomainSearchModeSelector({
  mode,
  onModeChange,
}: DomainSearchModeSelectorProps) {
  return (
    <div>
      <div className="flex gap-4">
        <Button
          variant={mode === "find" ? "default" : "outline"}
          className="flex-1"
          onClick={() => onModeChange("find")}
        >
          Find new domain
        </Button>
        <Button
          variant={mode === "ai-generate" ? "default" : "outline"}
          className="flex-1 relative"
          onClick={() => onModeChange("ai-generate")}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Generate domain using AI</span>
          </div>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full"></span>
        </Button>
      </div>
    </div>
  );
}
