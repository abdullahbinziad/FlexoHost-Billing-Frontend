"use client";

import type { Addon } from "@/types/checkout";
import { AddonCard } from "./AddonCard";

interface AvailableAddonsProps {
  addons: Addon[];
  selectedAddons: Addon[];
  onAddonToggle: (addon: Addon) => void;
}

export function AvailableAddons({
  addons,
  selectedAddons,
  onAddonToggle,
}: AvailableAddonsProps) {
  const handleAddonToggle = (addon: Addon) => {
    onAddonToggle(addon);
  };

  const handleRemove = (addonId: string) => {
    const addon = addons.find((a) => a.id === addonId);
    if (addon) {
      onAddonToggle(addon);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Available Addons
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enhance your hosting plan with these powerful addons
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {addons.map((addon) => {
          const isAdded = selectedAddons.some((a) => a.id === addon.id);
          return (
            <AddonCard
              key={addon.id}
              addon={addon}
              isAdded={isAdded}
              onAdd={handleAddonToggle}
              onRemove={handleRemove}
            />
          );
        })}
      </div>
    </div>
  );
}
