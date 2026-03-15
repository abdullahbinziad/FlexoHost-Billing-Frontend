"use client";

import { useState } from "react";
import { Key, Copy, Check } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import type { DomainDetails } from "@/types/domain-manage";

interface EppCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainDetails;
  /** EPP code from API; when null and not loading, shows "Not Available". */
  eppCode?: string | null;
  isLoading?: boolean;
}

export function EppCodeModal({ isOpen, onClose, domain, eppCode: eppCodeProp, isLoading }: EppCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const eppCode =
    isLoading
      ? "Loading..."
      : (eppCodeProp !== undefined && eppCodeProp !== null
          ? eppCodeProp
          : domain.eppCode || "Not Available");

  const handleCopy = () => {
    if (eppCode && eppCode !== "Not Available") {
      navigator.clipboard.writeText(eppCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="EPP Code (Authorization Code)" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The EPP code (also known as authorization code) is required to transfer your domain to
          another registrar. Keep this code secure and do not share it publicly.
        </p>

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
            {eppCode !== "Not Available" && eppCode !== "Loading..." && (
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
    </Modal>
  );
}
