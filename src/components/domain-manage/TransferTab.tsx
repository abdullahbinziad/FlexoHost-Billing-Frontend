"use client";

import { ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DomainDetails } from "@/types/domain-manage";

interface TransferTabProps {
  domain: DomainDetails;
}

export function TransferTab({ domain }: TransferTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Transfer in a Domain
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Transfer your domain from another registrar to us. You&apos;ll need the EPP code from
          your current registrar.
        </p>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                Requirements for Transfer
              </p>
              <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1 list-disc list-inside">
                <li>Domain must be unlocked at current registrar</li>
                <li>You need the EPP/Authorization code</li>
                <li>Domain must be at least 60 days old</li>
                <li>Domain must not be expired or pending expiration</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Domain Name
            </label>
            <input
              type="text"
              placeholder="example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              EPP Code / Authorization Code
            </label>
            <input
              type="text"
              placeholder="Enter EPP code from your current registrar"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <Button className="w-full">
            <ArrowRight className="w-4 h-4" />
            Initiate Transfer
          </Button>
        </div>
      </div>
    </div>
  );
}
