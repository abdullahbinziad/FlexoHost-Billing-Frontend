"use client";

import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Addon } from "@/types/checkout";
import { formatCurrency } from "@/utils/format";

interface AddonCardProps {
  addon: Addon;
  isAdded: boolean;
  onAdd: (addon: Addon) => void;
  onRemove?: (addonId: string) => void;
}

export function AddonCard({ addon, isAdded, onAdd, onRemove }: AddonCardProps) {
  return (
    <div
      className={cn(
        "relative p-6 rounded-lg border-2 transition-all",
        "hover:shadow-lg",
        isAdded
          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary/50"
      )}
    >
      {/* Added Indicator Badge */}
      {isAdded && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
          <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
        </div>
      )}

      <div className="space-y-4">
        {/* Header Section */}
        <div className="space-y-2 pr-8">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                {addon.name}
              </h3>
            </div>
            {addon.isFree && (
              <span className="px-2.5 py-1 bg-primary/10 dark:bg-primary/20 text-primary text-xs font-semibold rounded-full whitespace-nowrap">
                Free
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {addon.description}
          </p>
        </div>

        {/* Price and Action Section */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-baseline gap-2">
            {addon.promotionalPrice !== undefined &&
            addon.promotionalPrice < addon.price ? (
              <>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(addon.promotionalPrice)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatCurrency(addon.price)}
                </span>
              </>
            ) : addon.isFree ? (
              <span className="text-xl font-bold text-primary">Free</span>
            ) : (
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(addon.price)}
              </span>
            )}
          </div>

          <Button
            onClick={() => (isAdded && onRemove ? onRemove(addon.id) : onAdd(addon))}
            variant={isAdded ? "outline" : "default"}
            size="sm"
            className={cn(
              "whitespace-nowrap",
              isAdded
                ? "border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
