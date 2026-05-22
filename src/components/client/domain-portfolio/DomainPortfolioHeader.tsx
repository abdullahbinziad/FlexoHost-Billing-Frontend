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
    <div className="flex flex-col gap-4 mb-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl break-words">
          Domain portfolio
        </h1>
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm"
        >
          <Link
            href="/client"
            className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Home</span>
          </Link>
          <span aria-hidden className="text-gray-400 dark:text-gray-500">
            /
          </span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Domain portfolio</span>
        </nav>
      </div>
      <Button onClick={onAddDomain} className="w-full shrink-0 sm:w-auto">
        <Plus className="w-5 h-5 shrink-0" />
        Add new domain
      </Button>
    </div>
  );
}
