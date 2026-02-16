"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { DomainProtectionOffer } from "@/types/domain";
import { formatCurrency } from "@/utils/format";

interface DomainProtectionCardProps {
  offer: DomainProtectionOffer;
  onGetNow: () => void;
}

export function DomainProtectionCard({
  offer,
  onGetNow,
}: DomainProtectionCardProps) {
  return (
    <div className="mb-6 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-brand-primary-100 dark:bg-brand-primary-900/30 rounded-lg">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Protect your internet identity
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-900 dark:text-gray-100 font-medium">{offer.domain}</span>
              <span className="text-gray-500 dark:text-gray-400">or</span>
              <Link
                href="#"
                className="text-primary hover:text-primary/90 font-medium text-sm"
              >
                See more options
              </Link>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 line-through">
                  {formatCurrency(offer.originalPrice, offer.currency)}
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                  Save {offer.discountPercentage}%
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(offer.discountedPrice, offer.currency)}/{offer.period}
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={onGetNow}
          className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white whitespace-nowrap"
        >
          Get now
        </Button>
      </div>
    </div>
  );
}
