"use client";

import { useState } from "react";
import { Key, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DomainDetails } from "@/types/domain-manage";

interface EppCodeTabProps {
  domain: DomainDetails;
}

export function EppCodeTab({ domain }: EppCodeTabProps) {
  const [copied, setCopied] = useState(false);
  const eppCode = domain.eppCode || "Not Available";

  const handleCopy = () => {
    if (eppCode && eppCode !== "Not Available") {
      navigator.clipboard.writeText(eppCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          EPP Code (Authorization Code)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          The EPP code (also known as authorization code) is required to transfer your domain to
          another registrar. Keep this code secure and do not share it publicly.
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  EPP Code
                </label>
                <p className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
                  {eppCode}
                </p>
              </div>
              {eppCode !== "Not Available" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  className="ml-4"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              <strong>Important:</strong> You will need this code to transfer your domain. Store it
              securely and only share it with trusted parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
