"use client";

import { TldPricingCard } from "./TldPricingCard";
import { mockTldPricing } from "@/data/mockTlds";

interface TldPricingGridProps {
  onTldSelect?: (tld: string) => void;
}

export function TldPricingGrid({ onTldSelect }: TldPricingGridProps) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {mockTldPricing.map((tld) => (
          <TldPricingCard
            key={tld.tld}
            tld={tld}
            onSelect={onTldSelect}
          />
        ))}
      </div>
    </div>
  );
}
