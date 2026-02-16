"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import type { TldPricing } from "@/data/mockTlds";

interface TldPricingCardProps {
  tld: TldPricing;
  onSelect?: (tld: string) => void;
}

export function TldPricingCard({ tld, onSelect }: TldPricingCardProps) {
  const hasDiscount = tld.originalPrice > tld.discountedPrice;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((tld.originalPrice - tld.discountedPrice) / tld.originalPrice) * 100
      )
    : 0;

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
          {hasDiscount && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-through">
              {formatCurrency(tld.originalPrice, tld.currency)}
            </p>
          )}
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(tld.discountedPrice, tld.currency)}
          </p>
          {hasDiscount && discountPercentage > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
              Save {discountPercentage}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
