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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg mb-1">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <Button
          onClick={handleClick}
          className="w-full shrink-0 sm:w-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Order Now
        </Button>
      </div>
    </div>
  );
}
