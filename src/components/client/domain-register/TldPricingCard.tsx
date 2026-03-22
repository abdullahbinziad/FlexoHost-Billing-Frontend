"use client";

import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface TldPricingCardData {
  tld: string;
  price: number;
}

interface TldPricingCardProps {
  tld: TldPricingCardData;
  onSelect?: (tld: string) => void;
}

export function TldPricingCard({ tld, onSelect }: TldPricingCardProps) {
  const formatCurrency = useFormatCurrency();

  return (
    <div
      onClick={() => onSelect?.(tld.tld)}
      className={cn(
        "p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-brand-primary-300 dark:hover:border-brand-primary-700",
        onSelect && "hover:border-brand-primary-300 dark:hover:border-brand-primary-700"
      )}
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{tld.tld}</h3>
        <div className="space-y-1.5">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(tld.price)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">from / year</p>
        </div>
      </div>
    </div>
  );
}
