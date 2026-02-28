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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Domain Configuration
      </h2>

      {/* Selected Domain Summary Card */}
      {selectedDomain ? (
        <div className={cn(
          "border rounded-lg p-6",
          selectedAction === "transfer"
            ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30"
            : "bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30"
        )}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                selectedAction === "transfer"
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-primary/20"
              )}>
                {selectedAction === "transfer" ? (
                  <ArrowRightLeft className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
                ) : (
                  <Check className="w-6 h-6 text-primary" strokeWidth={3} />
                )}
              </div>
              <div>
                <p className={cn(
                  "text-sm font-medium mb-1",
                  selectedAction === "transfer"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-primary"
                )}>
                  {selectedAction === "transfer" ? "Domain Transfer" : "Selected Domain"}
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedDomain.domain}<span className={selectedAction === "transfer" ? "text-amber-600 dark:text-amber-400" : "text-primary"}>{selectedDomain.tld}</span>
                  </h3>
                </div>
                {selectedDomain.period && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedAction === "transfer"
                      ? <>Extend <span className="font-semibold text-gray-900 dark:text-gray-100">1 Year</span> after Transfer</>
                      : <>Registration Period: <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedDomain.period} {selectedDomain.period === 1 ? 'Year' : 'Years'}</span></>
                    }
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => onDomainSelect(undefined)}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 border-gray-300 dark:border-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              Change Domain
            </Button>
          </div>
        </div>
      ) : (
        <>
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={selectedAction === "transfer" ? "Enter domain to transfer (e.g. mydomain)" : "Search for a new domain name (e.g. mybusiness)"}
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
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
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
                                  selectedTld === tld.tld &&
                                  "bg-primary/5 dark:bg-primary/10"
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
                                {tld.isSpotlight && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-primary/10 text-primary rounded-full">
                                    {tld.label || "Recommended"}
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
                  disabled={isSearchingApi || !searchQuery.trim()}
                >
                  {isSearchingApi ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Domain Availability Result */}
              {searchResult && (
                <div
                  className={cn(
                    "mt-4 p-4 rounded-lg border transition-all",
                    searchResult.available
                      ? "bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30"
                      : selectedAction === "transfer"
                        ? rawApiAvailable
                          ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30"
                          : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30"
                        : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30"
                  )}
                >
                  {searchResult.available ? (
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 w-full">
                      {/* Domain Info and Availability */}
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shadow-sm">
                          <Check
                            className="w-6 h-6 text-primary"
                            strokeWidth={3}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">
                            Available
                          </p>
                          <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-baseline gap-1 break-words">
                            <span>{searchResult.domain}</span>
                            <span className="text-primary">{searchResult.tld}</span>
                          </p>
                        </div>
                      </div>

                      {/* Period Selector and Action */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6 w-full lg:w-auto">

                        {/* Compact Period Selector */}
                        <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-lg p-1 shadow-sm">
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
                                  "px-4 py-2 rounded-md transition-all text-sm font-semibold whitespace-nowrap",
                                  enabled
                                    ? "cursor-pointer"
                                    : "opacity-40 cursor-not-allowed",
                                  isSelected
                                    ? "bg-primary text-primary-foreground shadow"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                                )}
                              >
                                {years} {years === 1 ? "Year" : "Years"}
                              </button>
                            );
                          })}
                        </div>

                        {/* Total Price & Action Button */}
                        <div className="flex items-center justify-between sm:justify-start gap-5 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-gray-800">
                          <div className="text-right">
                            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {formatCurrency(getPeriodPrice(selectedPeriod))}
                            </p>
                            {getSavings(selectedPeriod) ? (
                              <p className="text-xs text-primary font-bold">
                                Save {formatCurrency(getSavings(selectedPeriod)!)}
                              </p>
                            ) : (
                              <p className="text-xs text-transparent select-none">Save</p>
                            )}
                          </div>

                          <Button
                            onClick={handleAddToCart}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap shadow-md hover:shadow-lg transition-all"
                            size="lg"
                            disabled={!isPeriodEnabled(selectedPeriod)}
                          >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Take Domain
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : selectedAction === "transfer" ? (
                    rawApiAvailable ? (
                      /* ── Domain is NOT registered yet — can't transfer ── */
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <AlertCircle
                            className="w-5 h-5 text-blue-600 dark:text-blue-400"
                            strokeWidth={2.5}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                            Not Registered Yet
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {searchResult.domain}
                            <span className="text-gray-500">{searchResult.tld}</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            This domain is not registered yet and cannot be transferred. You can register it instead.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* ── Domain IS registered — show transfer flow ── */
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 w-full">
                        {/* Domain Info */}
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center shadow-sm">
                            <ArrowRightLeft
                              className="w-6 h-6 text-amber-600 dark:text-amber-400"
                              strokeWidth={2.5}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
                              Transfer Domain
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-baseline gap-1 break-words">
                              <span>{searchResult.domain}</span>
                              <span className="text-amber-600 dark:text-amber-400">{searchResult.tld}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Extend 1 year after transfer
                            </p>
                          </div>
                        </div>

                        {/* EPP Code + Price + Button */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-5 w-full lg:w-auto">
                          {/* EPP Code Input */}
                          <div className="flex-1 min-w-0 sm:min-w-[220px]">
                            <input
                              type="text"
                              value={eppCode}
                              onChange={(e) => setEppCode(e.target.value)}
                              placeholder="EPP / Auth Code"
                              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-mono tracking-wider text-sm"
                            />
                          </div>

                          {/* Price & Action */}
                          <div className="flex items-center justify-between sm:justify-start gap-5 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-gray-800">
                            <div className="text-right">
                              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(getPeriodPrice(1))}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Transfer Price</p>
                            </div>

                            <Button
                              onClick={handleAddToCart}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap shadow-md hover:shadow-lg transition-all"
                              size="lg"
                              disabled={!isPeriodEnabled(1) || !eppCode.trim()}
                            >
                              <ArrowRightLeft className="w-5 h-5 mr-2" />
                              Transfer
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <X
                          className="w-5 h-5 text-red-600 dark:text-red-400"
                          strokeWidth={3}
                        />
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
                          This domain is already registered. Try a different name or
                          extension.
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
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={ownedDomain}
                  onChange={(e) => setOwnedDomain(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && ownedDomain.trim()) {
                      const parts = ownedDomain.trim().split(".");
                      const domain = parts[0];
                      const tld = parts.length > 1 ? "." + parts.slice(1).join(".") : "";
                      onDomainSelect({
                        domain,
                        tld,
                        available: true,
                        price: 0,
                      });
                    }
                  }}
                  placeholder="Enter your domain name (e.g. example.com)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button
                onClick={() => {
                  if (!ownedDomain.trim()) return;
                  const parts = ownedDomain.trim().split(".");
                  const domain = parts[0];
                  const tld = parts.length > 1 ? "." + parts.slice(1).join(".") : "";
                  onDomainSelect({
                    domain,
                    tld,
                    available: true,
                    price: 0,
                  });
                }}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
                disabled={!ownedDomain.trim()}
              >
                Use Domain
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}