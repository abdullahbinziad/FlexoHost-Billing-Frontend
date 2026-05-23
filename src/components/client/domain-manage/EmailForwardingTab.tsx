"use client";

import { useState } from "react";
import { Mail, Plus, X, Save, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DomainDetails, EmailForward } from "@/types/domain-manage";

interface EmailForwardingTabProps {
  domain: DomainDetails;
  onEmailForwardingChange?: (forwards: EmailForward[]) => void;
}

export function EmailForwardingTab({
  domain,
  onEmailForwardingChange,
}: EmailForwardingTabProps) {
  const [emailForwards, setEmailForwards] = useState<EmailForward[]>(
    domain.emailForwarding || []
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newForward, setNewForward] = useState({ from: "", to: [""] });

  const handleAdd = () => {
    if (newForward.from && newForward.to[0]) {
      const forward: EmailForward = {
        id: Date.now().toString(),
        from: newForward.from,
        to: newForward.to.filter((t) => t.trim()),
      };
      const updated = [...emailForwards, forward];
      setEmailForwards(updated);
      setNewForward({ from: "", to: [""] });
      setIsAdding(false);
      onEmailForwardingChange?.(updated);
    }
  };

  const handleRemove = (id: string) => {
    const updated = emailForwards.filter((f) => f.id !== id);
    setEmailForwards(updated);
    onEmailForwardingChange?.(updated);
  };

  const handleSave = () => {
    onEmailForwardingChange?.(emailForwards);
    // TODO: Show success message
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Forwarding
          </h3>
          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="w-4 h-4" />
            Add Forward
          </Button>
        </div>

        {/* Add New Forward Form */}
        {isAdding && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Forward From
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newForward.from}
                  onChange={(e) => setNewForward({ ...newForward, from: e.target.value })}
                  placeholder="info"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">@{domain.name}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Forward To
              </label>
              <input
                type="email"
                value={newForward.to[0]}
                onChange={(e) => setNewForward({ ...newForward, to: [e.target.value] })}
                placeholder="your-email@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
              >
                Add Forward
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewForward({ from: "", to: [""] });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Email Forwards List */}
        <div className="space-y-3">
          {emailForwards.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No email forwards configured
            </p>
          ) : (
            emailForwards.map((forward) => (
              <div
                key={forward.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {forward.from}@{domain.name}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {forward.to.join(", ")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(forward.id)}
                  className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <Button
          onClick={handleSave}
          className="mt-4 w-full"
        >
          <Save className="w-4 h-4" />
          Save Email Forwards
        </Button>
      </div>
    </div>
  );
}
