"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderNewHostingBannerProps {
  title?: string;
  description?: string;
  onOrderClick?: () => void;
}

export function OrderNewHostingBanner({
  title = "Want to order new hosting?",
  description = "Explore our hosting plans and get started with your new service.",
  onOrderClick,
}: OrderNewHostingBannerProps) {
  const handleClick = () => {
    if (onOrderClick) {
      onOrderClick();
    } else {
      window.location.href = "/checkout";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <Button
          onClick={handleClick}
          className="whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Order Now
        </Button>
      </div>
    </div>
  );
}
