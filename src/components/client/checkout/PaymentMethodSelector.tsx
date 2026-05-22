"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/checkout";

interface PaymentMethodSelectorProps {
  selected?: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const SSL_COMMERZ_METHOD: PaymentMethod = {
  id: "sslcommerz",
  name: "Online Payment (SSL Commerz)",
  logo: "SSL",
};

export function PaymentMethodSelector({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  // ✅ Auto-select on first render
  useEffect(() => {
    if (selected?.id !== SSL_COMMERZ_METHOD.id) {
      onSelect(SSL_COMMERZ_METHOD);
    }
  }, [selected?.id, onSelect]);

  const isSelected = selected?.id === SSL_COMMERZ_METHOD.id;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Payment Details
      </h2>

      <label
        className={cn(
          "flex items-center justify-between gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
          "hover:bg-gray-50 dark:hover:bg-gray-800/50",
          isSelected
            ? "border-primary bg-primary/5 dark:bg-primary/10"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        )}
        onClick={() => onSelect(SSL_COMMERZ_METHOD)}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex items-center">
            <input
              type="radio"
              name="payment-method"
              checked={isSelected}
              onChange={() => onSelect(SSL_COMMERZ_METHOD)}
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
            {SSL_COMMERZ_METHOD.name}
          </span>
        </div>

        {isSelected && <Check className="w-5 h-5 text-primary" />}
      </label>
    </div>
  );
}