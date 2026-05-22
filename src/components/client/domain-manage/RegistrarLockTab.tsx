"use client";

import { useState } from "react";
import { Lock, Unlock, AlertTriangle } from "lucide-react";
import type { DomainDetails } from "@/types/domain-manage";

interface RegistrarLockTabProps {
  domain: DomainDetails;
  onLockChange?: (locked: boolean) => void;
}

export function RegistrarLockTab({ domain, onLockChange }: RegistrarLockTabProps) {
  const [isLocked, setIsLocked] = useState(domain.registrarLock);

  const handleToggle = (locked: boolean) => {
    setIsLocked(locked);
    onLockChange?.(locked);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              {isLocked ? (
                <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
              Registrar Lock
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Registrar lock prevents unauthorized transfers of your domain to another registrar.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => handleToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {isLocked ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Domain is locked
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Your domain is protected from unauthorized transfers. You must unlock it before
                  transferring to another registrar.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  Domain is unlocked
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Your domain can be transferred to another registrar. Enable lock to protect it.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
