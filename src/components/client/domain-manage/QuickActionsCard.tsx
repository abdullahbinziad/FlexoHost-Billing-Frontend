"use client";

import { useState } from "react";
import { RefreshCw, Lock, Unlock, Key, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLazyGetEppCodeQuery } from "@/store/api/domainApi";
import type { DomainDetails } from "@/types/domain-manage";
import { NameserversModal } from "./NameserversModal";
import { EppCodeModal } from "./EppCodeModal";

interface QuickActionsCardProps {
  domain: DomainDetails;
  domainName: string;
  onAutoRenewalChange?: (enabled: boolean) => void;
  onLockChange?: (locked: boolean) => void;
  onNameserversChange?: (nameservers: string[]) => void;
}

export function QuickActionsCard({
  domain,
  domainName,
  onAutoRenewalChange,
  onLockChange,
  onNameserversChange,
}: QuickActionsCardProps) {
  const [autoRenewal, setAutoRenewal] = useState(domain.autoRenewal);
  const [isLocked, setIsLocked] = useState(domain.registrarLock);
  const [isNameserversModalOpen, setIsNameserversModalOpen] = useState(false);
  const [isEppCodeModalOpen, setIsEppCodeModalOpen] = useState(false);
  const [eppCode, setEppCode] = useState<string | null>(null);
  const [getEppCode, { isLoading: isLoadingEpp }] = useLazyGetEppCodeQuery();

  const handleAutoRenewalToggle = (enabled: boolean) => {
    setAutoRenewal(enabled);
    onAutoRenewalChange?.(enabled);
  };

  const handleLockToggle = (locked: boolean) => {
    setIsLocked(locked);
    onLockChange?.(locked);
  };

  const handleGetEppCode = async () => {
    setEppCode(null);
    setIsEppCodeModalOpen(true);
    try {
      const result = await getEppCode(domainName).unwrap();
      setEppCode(result.eppCode ?? "");
    } catch {
      setEppCode("Not Available");
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Auto Renewal */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Auto Renewal
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRenewal}
                  onChange={(e) => handleAutoRenewalToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Automatically renew before expiration
            </p>
          </div>

          {/* Registrar Lock */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isLocked ? (
                  <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-600 dark:text-green-400" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Registrar Lock
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLocked}
                  onChange={(e) => handleLockToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isLocked ? "Domain is locked" : "Domain is unlocked"}
            </p>
          </div>

          {/* Nameservers */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Nameservers
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNameserversModalOpen(true)}
                className="h-7 text-xs"
              >
                Edit
              </Button>
            </div>
            <div className="space-y-1">
              {domain.nameservers?.slice(0, 2).map((ns, index) => (
                <p key={index} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {ns}
                </p>
              ))}
            </div>
          </div>

          {/* EPP Code */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  EPP Code
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGetEppCode}
                className="h-7 text-xs"
              >
                Get
              </Button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Click Get to view authorization code
            </p>
          </div>
        </div>
      </div>

      <NameserversModal
        isOpen={isNameserversModalOpen}
        onClose={() => setIsNameserversModalOpen(false)}
        domain={domain}
        onSave={onNameserversChange}
      />
      <EppCodeModal
        isOpen={isEppCodeModalOpen}
        onClose={() => setIsEppCodeModalOpen(false)}
        domain={domain}
        eppCode={eppCode}
        isLoading={isLoadingEpp}
      />
    </>
  );
}
