"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/checkout";

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  methods,
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Payment Details</h2>
      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selected.id === method.id;

          return (
            <label
              key={method.id}
              className={cn(
                "flex items-center justify-between gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                isSelected
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    name="payment-method"
                    checked={isSelected}
                    onChange={() => onSelect(method)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                    )}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                </div>
                <span className="flex-1 text-gray-900 dark:text-gray-100 font-medium">
                  {method.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {method.logo && (
                  <div className="w-16 h-10 relative">
                    {/* Placeholder for payment logo - replace with actual image */}
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                      Logo
                    </div>
                  </div>
                )}
                {isSelected && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
