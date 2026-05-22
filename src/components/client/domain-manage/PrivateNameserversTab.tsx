"use client";

import { useState } from "react";
import { Globe, Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DomainDetails } from "@/types/domain-manage";

interface PrivateNameserversTabProps {
  domain: DomainDetails;
  onPrivateNameserversChange?: (nameservers: string[]) => void;
}

export function PrivateNameserversTab({ domain, onPrivateNameserversChange }: PrivateNameserversTabProps) {
  const [privateNameservers, setPrivateNameservers] = useState<string[]>([]);
  const [newNameserver, setNewNameserver] = useState("");

  const handleAdd = () => {
    if (newNameserver.trim() && !privateNameservers.includes(newNameserver.trim())) {
      const updated = [...privateNameservers, newNameserver.trim()];
      setPrivateNameservers(updated);
      setNewNameserver("");
      onPrivateNameserversChange?.(updated);
    }
  };

  const handleRemove = (index: number) => {
    const updated = privateNameservers.filter((_, i) => i !== index);
    setPrivateNameservers(updated);
    onPrivateNameserversChange?.(updated);
  };

  const handleSave = () => {
    onPrivateNameserversChange?.(privateNameservers);
    // TODO: Show success message
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Private Nameservers
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configure custom private nameservers for your domain. This allows you to use branded
          nameservers like ns1.{domain.name} and ns2.{domain.name}.
        </p>

        <div className="space-y-3">
          {privateNameservers.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No private nameservers configured
            </p>
          ) : (
            privateNameservers.map((ns, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {ns}
                </span>
                <button
                  onClick={() => handleRemove(index)}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newNameserver}
              onChange={(e) => setNewNameserver(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
              placeholder={`ns1.${domain.name}`}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <Button
              variant="secondary"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          <Button
            onClick={handleSave}
            className="w-full"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
