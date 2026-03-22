"use client";

import { Plus, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DomainPortfolioHeaderProps {
  onAddDomain: () => void;
}

export function DomainPortfolioHeader({
  onAddDomain,
}: DomainPortfolioHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Domain portfolio</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/client"
            className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>-</span>
          </Link>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Domain portfolio</span>
        </div>
      </div>
      <Button onClick={onAddDomain}>
        <Plus className="w-5 h-5" />
        Add new domain
      </Button>
    </div>
  );
}
