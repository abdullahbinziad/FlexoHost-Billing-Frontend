"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DomainAction, DomainSearchResult } from "@/types/checkout";
import { formatCurrency } from "@/utils/format";

interface DomainConfigurationProps {
  selectedAction: DomainAction;
  onActionChange: (action: DomainAction) => void;
  onDomainSelect: (domain: DomainSearchResult) => void;
}

const allTlds = [
  { tld: ".com", price: 1349, isFree: true },
  { tld: ".net", price: 1003, isFree: true },
  { tld: ".org", price: 1200, isFree: false },
  { tld: ".info", price: 800, isFree: false },
  { tld: ".me", price: 1420, isFree: true },
  { tld: ".online", price: 360, isFree: true },
  { tld: ".xyz", price: 250, isFree: false },
  { tld: ".io", price: 3500, isFree: false },
  { tld: ".co", price: 2500, isFree: false },
  { tld: ".ai", price: 4500, isFree: false },
  { tld: ".app", price: 1500, isFree: false },
  { tld: ".dev", price: 1200, isFree: false },
  { tld: ".tech", price: 800, isFree: false },
  { tld: ".store", price: 600, isFree: false },
  { tld: ".shop", price: 500, isFree: false },
  { tld: ".site", price: 400, isFree: false },
  { tld: ".website", price: 350, isFree: false },
  { tld: ".space", price: 300, isFree: false },
  { tld: ".cloud", price: 700, isFree: false },
  { tld: ".host", price: 450, isFree: false },
];

export function DomainConfiguration({
  selectedAction,
  onActionChange,
  onDomainSelect,
}: DomainConfigurationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTld, setSelectedTld] = useState(".com");
  const [tldSearchQuery, setTldSearchQuery] = useState("");
  const [isTldDropdownOpen, setIsTldDropdownOpen] = useState(false);
  const [searchResult, setSearchResult] = useState<DomainSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1); // Years
  const tldDropdownRef = useRef<HTMLDivElement>(null);

  const domainActions: { id: DomainAction; label: string }[] = [
    { id: "register", label: "Register Domain" },
    { id: "transfer", label: "Transfer Domain" },
    { id: "use-owned", label: "Use Owned Domain" },
  ];

  // Filter TLDs based on search query
  const filteredTlds = useMemo(() => {
    if (!tldSearchQuery.trim()) {
      return allTlds;
    }
    const query = tldSearchQuery.toLowerCase().trim();
    return allTlds.filter((tld) =>
      tld.tld.toLowerCase().includes(query)
    );
  }, [tldSearchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tldDropdownRef.current &&
        !tldDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTldDropdownOpen(false);
      }
    };

    if (isTldDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTldDropdownOpen]);

  const handleTldSelect = (tld: string) => {
    setSelectedTld(tld);
    setIsTldDropdownOpen(false);
    setTldSearchQuery(""); // Clear search when selecting
  };

  // ============================================
  // DUMMY DATA FOR TESTING - REMOVE WHEN BACKEND IS READY
  // ============================================
  // Demo domain pricing for different periods
  const getDemoDomainPricing = (domain: string, tld: string, years: number): number => {
    // Demo pricing for habibi.com
    if (domain.toLowerCase() === "habibi" && tld === ".com") {
      const pricing: Record<number, number> = {
        1: 1349,   // 1 year
        2: 2498,   // 2 years (save 200)
        3: 3497,   // 3 years (save 550)
        5: 5495,   // 5 years (save 1250)
        10: 10490, // 10 years (save 3000)
      };
      return pricing[years] || pricing[1] * years;
    }
    
    // Default pricing for other domains
    const tldInfo = allTlds.find((t) => t.tld === tld);
    const basePrice = tldInfo?.price || 0;
    return basePrice * years;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const domainName = searchQuery.trim().toLowerCase();
    const tldInfo = allTlds.find((t) => t.tld === selectedTld);
    
    // Dummy logic: Some domains are unavailable for testing
    // Domains that are "taken" (unavailable)
    const unavailableDomains = [
      "google", "facebook", "twitter", "instagram", "youtube",
      "amazon", "microsoft", "apple", "netflix", "github",
      "test", "example", "demo", "admin", "www"
    ];
    
    const isUnavailable = unavailableDomains.includes(domainName);
    
    // For testing: Randomly make some domains unavailable (10% chance)
    // Remove this when backend is ready
    const randomUnavailable = Math.random() < 0.1;
    
    const result: DomainSearchResult = {
      domain: searchQuery.trim(),
      tld: selectedTld,
      available: !isUnavailable && !randomUnavailable,
      price: tldInfo?.price || 0,
      promotionalPrice: tldInfo?.isFree ? 0 : undefined,
    };
    // ============================================
    // END DUMMY DATA
    // ============================================

    setSearchResult(result);
    setIsSearching(false);
  };

  const handleAddToCart = () => {
    if (searchResult) {
      // Get price for selected period (using demo pricing if applicable)
      const totalPrice = getPeriodPrice(selectedPeriod);
      
      const domainWithPeriod: DomainSearchResult = {
        ...searchResult,
        price: totalPrice,
      };
      onDomainSelect(domainWithPeriod);
    }
  };

  // Calculate prices for different periods
  const getPeriodPrice = (years: number): number => {
    if (!searchResult) return 0;
    
    // Check if it's a demo domain with special pricing
    const domainName = searchResult.domain.toLowerCase();
    if (domainName === "habibi" && searchResult.tld === ".com") {
      return getDemoDomainPricing(domainName, searchResult.tld, years);
    }
    
    // Default pricing calculation
    const basePrice = searchResult.promotionalPrice !== undefined && searchResult.promotionalPrice === 0
      ? 0
      : searchResult.price;
    return basePrice * years;
  };

  // Calculate savings for longer periods
  const getSavings = (years: number): number | null => {
    if (!searchResult || years === 1) return null;
    
    const oneYearPrice = getPeriodPrice(1);
    const multiYearPrice = getPeriodPrice(years);
    const savings = (oneYearPrice * years) - multiYearPrice;
    
    return savings > 0 ? savings : null;
  };

  const periodOptions = [1, 2, 3, 5, 10];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Domain Configuration</h2>

      {/* Domain Action Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {domainActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionChange(action.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              selectedAction === action.id
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Domain Search (only for register/transfer) */}
      {(selectedAction === "register" || selectedAction === "transfer") && (
        <div className="space-y-3">
          {/* Domain Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Find your new domain name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* TLD Dropdown Select */}
            <div className="relative" ref={tldDropdownRef}>
              <button
                type="button"
                onClick={() => setIsTldDropdownOpen(!isTldDropdownOpen)}
                className="flex items-center justify-between gap-2 px-4 py-3 min-w-[120px] border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <span className="text-sm font-medium">{selectedTld}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform",
                    isTldDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* TLD Dropdown Menu */}
              {isTldDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  {/* TLD Search Input inside Dropdown */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={tldSearchQuery}
                        onChange={(e) => setTldSearchQuery(e.target.value)}
                        placeholder="Search TLDs..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* TLD List with Radio Buttons */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredTlds.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredTlds.map((tld) => (
                          <label
                            key={tld.tld}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                              selectedTld === tld.tld && "bg-primary/5 dark:bg-primary/10"
                            )}
                            onClick={() => handleTldSelect(tld.tld)}
                          >
                            <input
                              type="radio"
                              name="tld"
                              value={tld.tld}
                              checked={selectedTld === tld.tld}
                              onChange={() => handleTldSelect(tld.tld)}
                              className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-2"
                            />
                            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                              {tld.tld}
                            </span>
                            {tld.isFree && (
                              <span className="text-xs text-primary font-semibold">
                                Free
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No TLDs found matching &quot;{tldSearchQuery}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleSearch}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Domain Availability Result */}
          {searchResult && (
            <div className={cn(
              "mt-4 p-4 rounded-lg border transition-all",
              searchResult.available
                ? "bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30"
                : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30"
            )}>
              {searchResult.available ? (
                <div className="space-y-4">
                  {/* Domain Info and Availability */}
                  <div className="flex items-center gap-3">
                    {/* Availability Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
                      <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                    </div>
                    
                    {/* Domain Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary mb-1">
                        Available
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 break-words">
                        <span>{searchResult.domain}</span>
                        <span className="text-primary">{searchResult.tld}</span>
                      </p>
                    </div>
                  </div>

                  {/* Period Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Registration Period
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {periodOptions.map((years) => {
                        const periodPrice = getPeriodPrice(years);
                        const savings = getSavings(years);
                        const isSelected = selectedPeriod === years;
                        return (
                          <button
                            key={years}
                            type="button"
                            onClick={() => setSelectedPeriod(years)}
                            className={cn(
                              "px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium relative",
                              "hover:shadow-sm",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-md"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:border-primary/50"
                            )}
                          >
                            <div className="text-center">
                              <div className="font-semibold">{years} {years === 1 ? "Year" : "Years"}</div>
                              {searchResult.promotionalPrice !== undefined && searchResult.promotionalPrice === 0 ? (
                                <div className="text-xs opacity-90">Free</div>
                              ) : (
                                <>
                                  <div className="text-xs opacity-90">{formatCurrency(periodPrice)}</div>
                                  {savings && savings > 0 && (
                                    <div className="text-xs text-primary font-semibold mt-0.5">
                                      Save {formatCurrency(savings)}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total Price and Action */}
                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Price</p>
                      {searchResult.promotionalPrice !== undefined && searchResult.promotionalPrice === 0 ? (
                        <p className="text-2xl font-bold text-primary">Free</p>
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(getPeriodPrice(selectedPeriod))}
                          </p>
                          {getSavings(selectedPeriod) && (
                            <p className="text-sm text-primary font-semibold mt-1">
                              You save {formatCurrency(getSavings(selectedPeriod)!)} compared to 1 year
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Take Domain Button */}
                    <Button
                      onClick={handleAddToCart}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
                      size="lg"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Take Domain
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                      Not Available
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {searchResult.domain}
                      <span className="text-gray-500">{searchResult.tld}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This domain is already registered. Try a different name or extension.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Use Owned Domain Input */}
      {selectedAction === "use-owned" && (
        <div>
          <input
            type="text"
            placeholder="Enter your domain name"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
}
