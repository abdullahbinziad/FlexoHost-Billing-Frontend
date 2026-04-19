"use client";

import { Ban, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import type { BillingCycle, BillingCycleOption } from "@/types/checkout";
import { normalizeBillingCycleKey } from "@/utils/promoDiscount";
import { useMemo } from "react";

const COUPON_CYCLE_HINT = "Not available for this coupon.";

interface BillingCycleSelectorProps {
  options: BillingCycleOption[];
  selected: BillingCycle;
  onSelect: (cycle: BillingCycle) => void;
  /** When set (non-empty), only these cycles work with the applied coupon; others are disabled. */
  couponAllowedBillingCycles?: string[] | null;
  appliedCouponCode?: string;
}

export function BillingCycleSelector({
  options,
  selected,
  onSelect,
  couponAllowedBillingCycles,
  appliedCouponCode,
}: BillingCycleSelectorProps) {
  const formatCurrency = useFormatCurrency();

  const allowedNormalized = useMemo(() => {
    const code = appliedCouponCode?.trim();
    if (!code || !couponAllowedBillingCycles?.length) return null;
    return new Set(couponAllowedBillingCycles.map((c) => normalizeBillingCycleKey(c)));
  }, [appliedCouponCode, couponAllowedBillingCycles]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Billing Cycle</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((option) => {
          const isSelected = selected === option.id;
          const hasDiscount = option.discountPercentage && option.discountPercentage > 0;
          const isCouponBlocked =
            allowedNormalized !== null && !allowedNormalized.has(normalizeBillingCycleKey(String(option.id)));

          return (
            <div
              key={option.id}
              className={cn("group relative w-full", isCouponBlocked && "cursor-not-allowed")}
              title={isCouponBlocked ? COUPON_CYCLE_HINT : undefined}
            >
              {/* Hover hint for coupon-restricted cycles */}
              {isCouponBlocked ? (
                <div
                  role="tooltip"
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-full z-20 mt-2 max-w-[min(100%,240px)] -translate-x-1/2",
                    "rounded-md border border-border/80 bg-popover px-3 py-2 text-center text-xs leading-snug text-popover-foreground shadow-md",
                    "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                    "invisible group-hover:visible"
                  )}
                >
                  {COUPON_CYCLE_HINT}
                </div>
              ) : null}

              <Button
                type="button"
                variant="outline"
                disabled={isCouponBlocked}
                onClick={() => {
                  if (!isCouponBlocked) onSelect(option.id);
                }}
                className={cn(
                  "relative h-auto w-full justify-start rounded-lg border-2 p-4 text-left transition-all",
                  "hover:shadow-md",
                  isCouponBlocked &&
                    "border-dashed border-muted-foreground/35 bg-muted/30 opacity-[0.72] shadow-none hover:bg-muted/30 dark:bg-muted/20",
                  !isCouponBlocked && isSelected && "border-primary bg-primary/5 dark:bg-primary/10"
                )}
              >
                {isCouponBlocked ? (
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
                    <Ban className="h-3.5 w-3.5" aria-hidden />
                  </div>
                ) : isSelected ? (
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                ) : null}

                {hasDiscount && !isCouponBlocked && (
                  <div className="absolute left-2 top-2">
                    <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary dark:bg-primary/20">
                      Save {option.discountPercentage}%
                    </span>
                  </div>
                )}

                <div className={cn("mt-6", hasDiscount && !isCouponBlocked && "mt-8")}>
                  <p
                    className={cn(
                      "mb-1 text-sm font-medium capitalize text-gray-600 dark:text-gray-400",
                      isCouponBlocked && "text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold text-gray-900 dark:text-gray-100",
                      isCouponBlocked && "text-muted-foreground"
                    )}
                  >
                    {formatCurrency(option.price)}
                  </p>
                  {option.originalPrice && option.originalPrice > option.price && !isCouponBlocked && (
                    <p className="mt-1 text-sm text-gray-500 line-through dark:text-gray-400">
                      {formatCurrency(option.originalPrice)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(option.pricePerMonth)} per month
                  </p>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
