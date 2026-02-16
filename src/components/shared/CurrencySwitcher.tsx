"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

export function CurrencySwitcher() {
  const { selectedCurrency, availableCurrencies, changeCurrency } = useCurrency();
  // Local state for dropdown (UI-only)
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectCurrency = (code: string) => {
    changeCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
      >
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {selectedCurrency.symbol} {selectedCurrency.code}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            <div className="p-2">
              {/* Currency List */}
              {availableCurrencies.map((currency) => (
                <Button
                  key={currency.code}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectCurrency(currency.code)}
                  className={cn(
                    "w-full justify-between",
                    selectedCurrency.code === currency.code
                      ? "bg-primary/10 dark:bg-primary/20 text-primary font-medium"
                      : ""
                  )}
                >
                  <div>
                    <span className="font-medium">{currency.symbol}</span>{" "}
                    <span>{currency.code}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {currency.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
