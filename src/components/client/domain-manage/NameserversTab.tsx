"use client";

import { useState } from "react";
import { Server, Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DomainDetails } from "@/types/domain-manage";

interface NameserversTabProps {
  domain: DomainDetails;
  onNameserversChange?: (nameservers: string[]) => void;
}

export function NameserversTab({ domain, onNameserversChange }: NameserversTabProps) {
  const [nameservers, setNameservers] = useState<string[]>(domain.nameservers || []);
  const [newNameserver, setNewNameserver] = useState("");

  const handleAdd = () => {
    if (newNameserver.trim() && !nameservers.includes(newNameserver.trim())) {
      const updated = [...nameservers, newNameserver.trim()];
      setNameservers(updated);
      setNewNameserver("");
      onNameserversChange?.(updated);
    }
  };

  const handleRemove = (index: number) => {
    const updated = nameservers.filter((_, i) => i !== index);
    setNameservers(updated);
    onNameserversChange?.(updated);
  };

  const handleSave = () => {
    onNameserversChange?.(nameservers);
    // TODO: Show success message
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          Nameservers
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configure the nameservers your domain points to. Changes may take up to 48 hours to propagate.
        </p>

        <div className="space-y-3">
          {nameservers.map((ns, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {ns}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              value={newNameserver}
              onChange={(e) => setNewNameserver(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
              placeholder="ns1.example.com"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <Button
              variant="secondary"
              onClick={handleAdd}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          <Button
            onClick={handleSave}
            className="w-full gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
