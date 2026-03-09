"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, ShoppingCart, ArrowRightLeft, AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useCurrency } from "@/hooks/useCurrency";
import { useGetTldsQuery } from "@/store/api/tldApi";
import { useLazySearchDomainQuery } from "@/store/api/checkoutApi";
import type { DomainAction, DomainSearchResult } from "@/types/checkout";
import type { TLD } from "@/types/admin";

interface DomainConfigurationProps {
  selectedAction: DomainAction;
  selectedDomain?: DomainSearchResult;
  onActionChange: (action: DomainAction) => void;
  onDomainSelect: (domain: DomainSearchResult | undefined) => void;
}

type DomainSearchApiInner = {
  domain: string;
  extension: string;
  dynadotResult?: { domain_name?: string; available?: "Yes" | "No" | string };
  tldData?: TLD;
};

type DomainSearchApiResponse = {
  data?: DomainSearchApiInner;
} & Partial<DomainSearchApiInner>; // supports endpoints that return payload directly

export function DomainConfiguration({
  selectedAction,
  selectedDomain,
  onActionChange,
  onDomainSelect,
}: DomainConfigurationProps) {
  const formatCurrency = useFormatCurrency();
  const { selectedCurrency } = useCurrency();

  const { data: tlds = [] } = useGetTldsQuery();
  const [triggerSearch, { isFetching: isSearchingApi }] =
    useLazySearchDomainQuery();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTld, setSelectedTld] = useState(".com");
  const [tldSearchQuery, setTldSearchQuery] = useState("");
  const [isTldDropdownOpen, setIsTldDropdownOpen] = useState(false);

  const [searchResult, setSearchResult] = useState<DomainSearchResult | null>(
    null
  );

  // IMPORTANT: keep tldData from search so pricing always matches backend response
  const [searchedTldData, setSearchedTldData] = useState<TLD | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<number>(1); // Years
  const [eppCode, setEppCode] = useState<string>("");
  // Track raw API availability for transfer logic
  const [rawApiAvailable, setRawApiAvailable] = useState<boolean>(false);
  const [ownedDomain, setOwnedDomain] = useState<string>("");
  const tldDropdownRef = useRef<HTMLDivElement>(null);

  // Set default TLD when data is loaded
  useEffect(() => {
    if (tlds.length > 0 && !tlds.find((t) => t.tld === selectedTld)) {
      const spotlightTld = tlds.find((t) => t.isSpotlight);
      setSelectedTld(spotlightTld ? spotlightTld.tld : tlds[0].tld);
    }
  }, [tlds, selectedTld]);

  const domainActions: { id: DomainAction; label: string }[] = [
    { id: "register", label: "Register Domain" },
    { id: "transfer", label: "Transfer Domain" },
    { id: "use-owned", label: "Use Owned Domain" },
  ];

  // Filter TLDs based on search query
  const filteredTlds = useMemo(() => {
    const availableTlds = [...tlds].sort(
      (a, b) => (a.serial || 0) - (b.serial || 0)
    );

    if (!tldSearchQuery.trim()) return availableTlds;

    const query = tldSearchQuery.toLowerCase().trim();
    return availableTlds.filter((tld) => tld.tld.toLowerCase().includes(query));
  }, [tldSearchQuery, tlds]);

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

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTldDropdownOpen]);

  const handleTldSelect = (tld: string) => {
    setSelectedTld(tld);
    setIsTldDropdownOpen(false);
    setTldSearchQuery("");
  };

  const normalizeSearchPayload = (res: DomainSearchApiResponse): DomainSearchApiInner | null => {
    // RTK can return payload directly or wrapped in { data }
    const inner = (res as any)?.data ?? res;
    if (!inner) return null;
    if (!inner.extension) return null;
    return inner as DomainSearchApiInner;
  };

  // Reset and re-search when switching between Register / Transfer tabs
  useEffect(() => {
    // Always clear previous result so stale UI doesn't show
    setSearchResult(null);
    setSearchedTldData(null);
    setEppCode("");

    // Re-search only if there's a query
    if (searchQuery.trim()) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // unwrap for consistent promise rejection on error
      const res = (await triggerSearch({
        domain: searchQuery.trim(),
        tld: selectedTld,
      }).unwrap()) as DomainSearchApiResponse;

      const payload = normalizeSearchPayload(res);
      if (!payload) return;

      const apiAvailable =
        String(payload?.dynadotResult?.available || "")
          .toLowerCase()
          .trim() === "yes";

      // For transfer: available = false means domain IS registered (can transfer)
      // For register: available = true means domain is free (can register)
      const available = selectedAction === "transfer" ? false : apiAvailable;

      const result: DomainSearchResult = {
        domain: searchQuery.trim(),
        tld: payload.extension || selectedTld,
        available,
        price: 0, // computed by getPeriodPrice()
        promotionalPrice: undefined,
      };

      setSearchResult(result);
      setSearchedTldData(payload.tldData ?? null);
      setRawApiAvailable(apiAvailable);
      setSelectedPeriod(1);
      setEppCode("");
    } catch (error) {
      console.error("Domain search failed:", error);
    }
  };

  // ------- Pricing helpers (currency-aware) -------

  const getTldInfoForPricing = (): TLD | null => {
    if (!searchResult) return null;
    // Prefer backend tldData (authoritative), fallback to list
    return searchedTldData ?? tlds.find((t) => t.tld === searchResult.tld) ?? null;
  };

  const getCurrencyPricingBlock = (tldInfo: TLD | null) => {
    if (!tldInfo) return null;
    return (
      tldInfo.pricing.find((p) => p.currency === selectedCurrency.code) ?? null
    );
  };

  const isPeriodEnabled = (years: number): boolean => {
    const tldInfo = getTldInfoForPricing();
    const currencyPricing = getCurrencyPricingBlock(tldInfo);
    if (!currencyPricing) return false;

    const yearKey = String(years) as "1" | "2" | "3";
    return Boolean(currencyPricing[yearKey]?.enable);
  };

  const getPeriodPrice = (years: number): number => {
    if (!searchResult) return 0;

    const tldInfo = getTldInfoForPricing();
    const currencyPricing = getCurrencyPricingBlock(tldInfo);
    if (!currencyPricing) return 0;

    const yearKey = String(years) as "1" | "2" | "3";
    const pricing = currencyPricing[yearKey];
    if (!pricing?.enable) return 0;

    return selectedAction === "transfer" ? pricing.transfer : pricing.register;
  };

  const getSavings = (years: number): number | null => {
    if (!searchResult || years === 1) return null;
    if (!isPeriodEnabled(years) || !isPeriodEnabled(1)) return null;

    const oneYearPrice = getPeriodPrice(1);
    const multiYearPrice = getPeriodPrice(years);
    const savings = oneYearPrice * years - multiYearPrice;

    return savings > 0 ? savings : null;
  };

  const handleAddToCart = () => {
    if (!searchResult) return;
    // For transfer, EPP code is required
    if (selectedAction === "transfer" && !eppCode.trim()) return;

    // For transfer, always use 1-year period (no cycle selector)
    const period = selectedAction === "transfer" ? 1 : selectedPeriod;
    const totalPrice = getPeriodPrice(period);

    const domainWithPeriod: DomainSearchResult = {
      ...searchResult,
      price: totalPrice,
      period,
      ...(selectedAction === "transfer" ? { eppCode: eppCode.trim() } : {}),
    };

    onDomainSelect(domainWithPeriod);
  };

  const periodOptions = [1, 2, 3];

  return (
    <div className="space-y-4 min-w-0 overflow-hidden">
      <h2 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
        Domain
      </h2>

      {/* Selected Domain Summary */}
      {selectedDomain ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-4 h-4 text-primary" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {selectedDomain.domain}<span className="text-primary">{selectedDomain.tld}</span>
              </p>
              {selectedDomain.period && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {selectedDomain.period} {selectedDomain.period === 1 ? "year" : "years"}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDomainSelect(undefined)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 shrink-0"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          {/* Domain Action Tabs */}
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 -mx-1 px-1">
            {domainActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onActionChange(action.id)}
                className={cn(
                  "text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 pb-2 border-b-2 transition-colors",
                  selectedAction === action.id
                    ? "text-primary border-primary"
                    : "text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300"
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
              <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={selectedAction === "transfer" ? "mydomain.com" : "yourdomain.com"}
                    className="w-full min-w-0 pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* TLD Dropdown */}
                <div className="relative w-full sm:w-auto sm:min-w-[100px]" ref={tldDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsTldDropdownOpen(!isTldDropdownOpen)}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 w-full sm:w-auto sm:min-w-[100px] text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
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
                    <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 w-full sm:w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-md z-50">
                      <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                        <input
                          type="text"
                          value={tldSearchQuery}
                          onChange={(e) => setTldSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {filteredTlds.length > 0 ? (
                          filteredTlds.map((tld) => (
                            <button
                              key={tld.tld}
                              type="button"
                              onClick={() => handleTldSelect(tld.tld)}
                              className={cn(
                                "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800",
                                selectedTld === tld.tld && "bg-primary/5 text-primary font-medium"
                              )}
                            >
                              {tld.tld}
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-4 text-sm text-gray-500">No matches</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="w-full sm:w-auto shrink-0"
                  disabled={isSearchingApi || !searchQuery.trim()}
                >
                  {isSearchingApi ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Search</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Domain Availability Result */}
              {searchResult && (
                <div className="mt-3 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 overflow-hidden min-w-0 w-full max-w-full">
                  {searchResult.available ? (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 w-full min-w-0">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 overflow-hidden">
                          <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 break-all">
                            {searchResult.domain}<span className="text-primary">{searchResult.tld}</span>
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Available</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0 flex-shrink-0">
                        <div className="flex gap-1 flex-wrap">
                          {periodOptions.map((years) => {
                            const enabled = isPeriodEnabled(years);
                            const isSelected = selectedPeriod === years;
                            return (
                              <button
                                key={years}
                                type="button"
                                disabled={!enabled}
                                onClick={() => enabled && setSelectedPeriod(years)}
                                className={cn(
                                  "flex-1 min-w-[60px] sm:flex-initial sm:min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs font-medium transition-colors",
                                  !enabled && "opacity-40 cursor-not-allowed",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                                )}
                              >
                                {years} {years === 1 ? "Year" : "Years"}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                              {formatCurrency(getPeriodPrice(selectedPeriod))}
                            </p>
                            {getSavings(selectedPeriod) && (
                              <p className="text-xs text-primary">Save {formatCurrency(getSavings(selectedPeriod)!)}</p>
                            )}
                          </div>
                          <Button
                            onClick={handleAddToCart}
                            size="sm"
                            className="shrink-0"
                            disabled={!isPeriodEnabled(selectedPeriod)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1.5" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : selectedAction === "transfer" ? (
                    rawApiAvailable ? (
                      <div className="flex items-center gap-3 min-w-0">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="min-w-0 overflow-hidden">
                          <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 break-all">
                            {searchResult.domain}<span className="text-gray-500">{searchResult.tld}</span>
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Not registered yet. You can register it instead.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 w-full min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <ArrowRightLeft className="w-4 h-4 text-primary" strokeWidth={2} />
                          </div>
                          <div className="min-w-0 overflow-hidden">
                            <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 break-all">
                              {searchResult.domain}<span className="text-primary">{searchResult.tld}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">+ 1 year extension</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0 flex-shrink-0">
                          <input
                            type="text"
                            value={eppCode}
                            onChange={(e) => setEppCode(e.target.value)}
                            placeholder="EPP / Auth code"
                            className="w-full sm:min-w-[140px] px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <div className="flex items-center justify-between sm:justify-start gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-gray-700">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                              {formatCurrency(getPeriodPrice(1))}
                            </p>
                            <Button
                              onClick={handleAddToCart}
                              size="sm"
                              className="shrink-0"
                              disabled={!isPeriodEnabled(1) || !eppCode.trim()}
                            >
                              <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                              Transfer
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-3 min-w-0">
                      <X className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="min-w-0 overflow-hidden">
                        <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 break-all">
                          {searchResult.domain}<span className="text-gray-500">{searchResult.tld}</span>
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          Already registered. Try another name or extension.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Use Owned Domain */}
          {selectedAction === "use-owned" && (
            <div className="flex flex-col sm:flex-row gap-2 min-w-0">
              <div className="flex-1 relative min-w-0">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={ownedDomain}
                  onChange={(e) => setOwnedDomain(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && ownedDomain.trim()) {
                      const parts = ownedDomain.trim().split(".");
                      const domain = parts[0];
                      const tld = parts.length > 1 ? "." + parts.slice(1).join(".") : "";
                      onDomainSelect({ domain, tld, available: true, price: 0 });
                    }
                  }}
                  placeholder="example.com"
                  className="w-full min-w-0 pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button
                onClick={() => {
                  if (!ownedDomain.trim()) return;
                  const parts = ownedDomain.trim().split(".");
                  const domain = parts[0];
                  const tld = parts.length > 1 ? "." + parts.slice(1).join(".") : "";
                  onDomainSelect({ domain, tld, available: true, price: 0 });
                }}
                size="sm"
                className="w-full sm:w-auto shrink-0"
                disabled={!ownedDomain.trim()}
              >
                Use
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}