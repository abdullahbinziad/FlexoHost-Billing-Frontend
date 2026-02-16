"use client";

import { useState } from "react";
import { PromotionalBanner } from "@/components/shared/PromotionalBanner";
import { DomainSearchModeSelector } from "./DomainSearchModeSelector";
import { DomainSearchBar } from "./DomainSearchBar";
import { TldPricingGrid } from "./TldPricingGrid";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, Sparkles } from "lucide-react";

type SearchMode = "find" | "ai-generate";

export function RegisterDomainPage() {
  // Local state for search mode (UI-only)
  const [searchMode, setSearchMode] = useState<SearchMode>("find");
  // Local state for search results (will be replaced with API later)
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (domain: string) => {
    // TODO: Replace with actual API call
    console.log("Searching for domain:", domain);
    // Simulate search results
    setSearchResults([
      {
        domain: domain,
        available: true,
        tld: ".com",
        price: 0.01,
      },
    ]);
  };

  const handleTldSelect = (tld: string) => {
    // TODO: Handle TLD selection
    console.log("Selected TLD:", tld);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pb-16 pt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex justify-center">
              <Badge variant="secondary" className="mb-4">
                <Globe className="w-3 h-3 mr-1" />
                Domain Registration
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Find your perfect domain name
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Secure your brand identity with our powerful domain search. Choose
              from over 1000+ TLDs and get started instantly.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-4 md:p-6 space-y-6">
                <DomainSearchModeSelector
                  mode={searchMode}
                  onModeChange={setSearchMode}
                />
                <div className="relative">
                  <DomainSearchBar onSearch={handleSearch} />
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center"><Search className="w-3 h-3 mr-1" /> Instant Availability Check</span>
              <span className="flex items-center"><Sparkles className="w-3 h-3 mr-1" /> AI Suggestions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Search Results Section */}
        {searchResults.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Search Results
              </h2>
              <Badge variant="outline">{searchResults.length} found</Badge>
            </div>
            <div className="space-y-4">
              {/* Placeholder for results list */}
              {searchResults.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{result.domain}</div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">Available</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${result.price}</div>
                    <div className="text-xs text-gray-500">/year</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Popular Extensions
            </h3>
            <a href="#" className="text-sm text-brand-primary-600 hover:text-brand-primary-700 font-medium">View full price list &rarr;</a>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <TldPricingGrid onTldSelect={handleTldSelect} />
          </div>
        </div>

        {/* Promotional Banner */}
        <PromotionalBanner
          title="New Year deal: Get domain + free business email"
          description="Choose a domain with .ai, .io, .net, or .org for 2 years or longer and get 1 year of free email."
          variant="default"
        />
      </div>
    </div>
  );
}
