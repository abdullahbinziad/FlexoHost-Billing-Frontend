"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServerLocation } from "@/types/checkout";

// Import flag icons
import US from "country-flag-icons/react/3x2/US";
import MY from "country-flag-icons/react/3x2/MY";
import SG from "country-flag-icons/react/3x2/SG";
import BD from "country-flag-icons/react/3x2/BD";
import DE from "country-flag-icons/react/3x2/DE";
import FI from "country-flag-icons/react/3x2/FI";

// Map country codes to flag components
const flagComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  US,
  MY,
  SG,
  BD,
  DE,
  FI,
};

interface ServerLocationSelectorProps {
  locations: ServerLocation[];
  selected: ServerLocation;
  onSelect: (location: ServerLocation) => void;
}

export function ServerLocationSelector({
  locations,
  selected,
  onSelect,
}: ServerLocationSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Server Location</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {locations.map((location) => {
          const isSelected = selected.id === location.id;

          return (
            <label
              key={location.id}
              className={cn(
                "relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                isSelected
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md shadow-primary/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              )}
            >
              <input
                type="radio"
                name="server-location"
                checked={isSelected}
                onChange={() => onSelect(location)}
                className="sr-only"
              />
              
              {/* Selected Badge (top-right corner) */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                </div>
              )}

              {/* Radio Button Circle */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  isSelected
                    ? "border-primary bg-primary ring-2 ring-primary/20 dark:ring-primary/30 ring-offset-1"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                )}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                )}
              </div>
              
              {/* Country Name */}
              <span
                className={cn(
                  "flex-1 text-sm font-medium transition-colors",
                  isSelected
                    ? "text-primary font-semibold"
                    : "text-gray-900 dark:text-gray-100"
                )}
              >
                {location.country}
              </span>
              
              {/* Flag Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-7 h-5 rounded overflow-hidden border transition-all",
                  isSelected
                    ? "border-primary shadow-sm ring-1 ring-primary/20 dark:ring-primary/30"
                    : "border-gray-200 dark:border-gray-700"
                )}
                title={location.country}
              >
                {flagComponents[location.countryCode] ? (
                  React.createElement(flagComponents[location.countryCode], {
                    className: "w-full h-full object-cover",
                  })
                ) : (
                  <span className="text-xl">{location.flag}</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
