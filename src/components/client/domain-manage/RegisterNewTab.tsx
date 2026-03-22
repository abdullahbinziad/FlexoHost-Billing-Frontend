"use client";

import { Globe2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function RegisterNewTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Globe2 className="w-5 h-5" />
          Register a New Domain
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Search and register a new domain name for your website or business.
        </p>
        <Link
          href="/domains/register"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Globe2 className="w-4 h-4" />
          Go to Domain Registration
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
