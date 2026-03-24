"use client";

import { useMemo } from "react";
import { TldPricingCard } from "./TldPricingCard";
import { useGetTldsQuery } from "@/store/api/tldApi";
import { useCurrency } from "@/hooks/useCurrency";

interface TldPricingGridProps {
  onTldSelect?: (tld: string) => void;
}

export function TldPricingGrid({ onTldSelect }: TldPricingGridProps) {
  const { data: tlds = [] } = useGetTldsQuery();
  const { selectedCurrency } = useCurrency();

  const pricingCards = useMemo(() => {
    return [...tlds]
      .sort((a, b) => (a.serial || 0) - (b.serial || 0))
      .slice(0, 12)
      .map((tld) => {
        const pricing = tld.pricing.find((item) => item.currency === selectedCurrency.code);
        const firstYear = pricing?.["1"];
        return {
          tld: tld.tld,
          price: firstYear?.register ?? 0,
        };
      })
      .filter((item) => item.price > 0);
  }, [selectedCurrency.code, tlds]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {pricingCards.map((tld) => (
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
