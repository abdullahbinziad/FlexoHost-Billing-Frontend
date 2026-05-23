"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

export function CurrencySwitcher() {
  const { selectedCurrency, availableCurrencies, changeCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {selectedCurrency.symbol} {selectedCurrency.code}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-gray-500 transition-transform duration-200 dark:text-gray-400",
              "group-data-[state=open]:rotate-180"
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-64 max-w-[calc(100vw-1.5rem)] p-2"
      >
        {availableCurrencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onSelect={() => changeCurrency(currency.code)}
            className={cn(
              "flex cursor-pointer justify-between gap-3",
              selectedCurrency.code === currency.code
                ? "bg-primary/10 font-medium text-primary focus:bg-primary/15 dark:bg-primary/20 dark:focus:bg-primary/25"
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
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
