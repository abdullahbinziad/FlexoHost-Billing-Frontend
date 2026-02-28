"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import type { BillingCycle, BillingCycleOption } from "@/types/checkout";

interface BillingCycleSelectorProps {
  options: BillingCycleOption[];
  selected: BillingCycle;
  onSelect: (cycle: BillingCycle) => void;
}

export function BillingCycleSelector({
  options,
  selected,
  onSelect,
}: BillingCycleSelectorProps) {
  const formatCurrency = useFormatCurrency();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Billing Cycle</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((option) => {
          const isSelected = selected === option.id;
          const hasDiscount = option.discountPercentage && option.discountPercentage > 0;

          return (
            <Button
              key={option.id}
              variant="outline"
              onClick={() => onSelect(option.id)}
              className={cn(
                "relative p-4 h-auto rounded-lg border-2 transition-all text-left justify-start",
                "hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : ""
              )}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary text-xs font-semibold rounded">
                    Save {option.discountPercentage}%
                  </span>
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize mb-1">
                  {option.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(option.price)}
                </p>
                {option.originalPrice && option.originalPrice > option.price && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-through mt-1">
                    {formatCurrency(option.originalPrice)}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatCurrency(option.pricePerMonth)} per month
                </p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
