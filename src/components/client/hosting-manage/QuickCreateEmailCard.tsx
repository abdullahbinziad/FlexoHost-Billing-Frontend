"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateHostingEmailAccountMutation } from "@/store/api/servicesApi";
import type { HostingServiceDetails } from "@/types/hosting-manage";

/** Email local part: letters, numbers, dot, underscore, plus, hyphen. */
const LOCAL_PART_REGEX = /^[a-z0-9._+-]+$/;

interface QuickCreateEmailCardProps {
  clientId: string;
  service: HostingServiceDetails;
}

export function QuickCreateEmailCard({ clientId, service }: QuickCreateEmailCardProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [createEmail, { isLoading }] = useCreateHostingEmailAccountMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const local = username.trim().toLowerCase();
    if (!local) {
      toast.error("Enter an email username");
      return;
    }
    if (!LOCAL_PART_REGEX.test(local)) {
      toast.error("Use only letters, numbers, and . _ + -");
      return;
    }
    if (local.length > 64) {
      toast.error("Email username is too long");
      return;
    }
    if (!password || password.length < 5) {
      toast.error("Password must be at least 5 characters");
      return;
    }
    try {
      const result = await createEmail({
        clientId,
        serviceId: service.id,
        email: local,
        password,
      }).unwrap();
      toast.success(`Created ${result.email}. You can use it in Webmail or any mail client.`);
      setUsername("");
      setPassword("");
    } catch (e: any) {
      const msg = e?.data?.message ?? e?.message ?? "Failed to create email account";
      toast.error(msg);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Quick Create Email Account
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Create a new mailbox on this hosting account (cPanel). Use letters, numbers, and . _ + - only.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._+-]/g, ""))}
            placeholder="e.g. info, sales"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            disabled={isLoading}
            autoComplete="username"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 shrink-0">
            @{service.domain}
          </span>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 5 characters)"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          disabled={isLoading}
          autoComplete="new-password"
          minLength={5}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isLoading ? "Creating…" : "Create"}
        </Button>
      </form>
    </div>
  );
}
