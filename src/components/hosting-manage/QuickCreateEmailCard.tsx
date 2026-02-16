"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface QuickCreateEmailCardProps {
  service: HostingServiceDetails;
  onCreateEmail?: (username: string, password: string) => void;
}

export function QuickCreateEmailCard({
  service,
  onCreateEmail,
}: QuickCreateEmailCardProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onCreateEmail?.(username.trim(), password);
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Quick Create Email Account
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="flexsoftr"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            @{service.domain}
          </span>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        />
        <Button
          type="submit"
          className="w-full"
        >
          <Plus className="w-4 h-4" />
          Create
        </Button>
      </form>
    </div>
  );
}
