"use client";

import { useState } from "react";
import { ArrowRight, Tag, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import type { OrderSummary, BillingCycle, ServerLocation } from "@/types/checkout";

interface OrderSummaryCardProps {
  summary: OrderSummary;
  billingCycle?: BillingCycle;
  serverLocation?: ServerLocation;
  agreeToTerms: boolean;
  onAgreeToTermsChange: (agree: boolean) => void;
  onCheckout: () => void;
  onPromoCodeApply?: (code: string) => Promise<boolean>;
  onPromoCodeRemove?: () => void;
  appliedPromoCode?: string;
  appliedDiscountLabel?: string;
  discountLineLabel?: string;
  hasDomain?: boolean;
}

export function OrderSummaryCard({
  summary,
  billingCycle,
  serverLocation,
  agreeToTerms,
  onAgreeToTermsChange,
  onCheckout,
  onPromoCodeApply,
  onPromoCodeRemove,
  appliedPromoCode,
  appliedDiscountLabel = "Promo Code Applied",
  discountLineLabel = "Discount",
  hasDomain = false,
}: OrderSummaryCardProps) {
  const formatCurrency = useFormatCurrency();
  const [promoCode, setPromoCode] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim() || !onPromoCodeApply) return;

    setIsApplying(true);
    setPromoError(null);

    try {
      const success = await onPromoCodeApply(promoCode.trim().toUpperCase());
      if (success) {
        setPromoCode("");
        setIsExpanded(false);
      } else {
        setPromoError("Invalid or expired promo code");
      }
    } catch (error) {
      setPromoError("Failed to apply promo code. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemovePromoCode = () => {
    if (onPromoCodeRemove) {
      onPromoCodeRemove();
      setPromoError(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isApplying) {
      handleApplyPromoCode();
    }
  };

  return (
    <div className="lg:sticky lg:top-20">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6 space-y-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Order Summary</h2>

        {/* Order Items */}
        <div className="space-y-3">
          {summary.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                {item.billingCycle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {item.billingCycle}
                  </p>
                )}
                {item.type === "hosting" && serverLocation && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Server Location: {serverLocation.country}
                  </p>
                )}
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(item.price)}
              </p>
            </div>
          ))}
        </div>

        {/* Promo Code Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          {appliedPromoCode ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {appliedDiscountLabel}
                    </p>
                    <p className="text-xs text-primary font-semibold">{appliedPromoCode}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePromoCode}
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {!isExpanded ? (
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(true)}
                  className="w-full justify-center gap-2 border-dashed hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                >
                  <Tag className="w-4 h-4" />
                  Have a promo code?
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError(null);
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter promo code"
                        className={cn(
                          "w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all",
                          promoError
                            ? "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary"
                        )}
                        disabled={isApplying}
                      />
                    </div>
                    <Button
                      onClick={handleApplyPromoCode}
                      disabled={!promoCode.trim() || isApplying}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    >
                      {isApplying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-600 dark:text-red-400">{promoError}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false);
                      setPromoCode("");
                      setPromoError(null);
                    }}
                    className="w-full text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>
          {summary.discount && summary.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{discountLineLabel}</span>
              <span className="text-primary font-medium">
                -{formatCurrency(summary.discount)}
              </span>
            </div>
          )}
          {summary.tax && summary.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {formatCurrency(summary.tax)}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Total Due Today
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.total)}
            </span>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => onAgreeToTermsChange(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary bg-white dark:bg-gray-900"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I have read & agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                className="text-primary hover:underline"
              >
                Terms of Service
              </a>
            </span>
          </label>

          {/* Checkout Button */}
          {!hasDomain && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
              ⚠ Please configure a domain name to proceed.
            </p>
          )}
          <Button
            onClick={onCheckout}
            disabled={!agreeToTerms || !hasDomain}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            Checkout
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
