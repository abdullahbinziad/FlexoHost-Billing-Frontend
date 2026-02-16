"use client";

import { Shield, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import type { DomainDetails } from "@/types/domain-manage";

interface AddonsTabProps {
  domain: DomainDetails;
}

export function AddonsTab({ domain }: AddonsTabProps) {
  const addons = [
    {
      id: "domain-protection",
      name: "Domain Protection",
      description: "Protect your domain from unauthorized transfers and keep your contact information private",
      price: 11.99,
      currency: "USD",
      icon: Shield,
      enabled: false,
    },
    {
      id: "private-nameservers",
      name: "Private Nameservers",
      description: "Use custom nameservers for your domain",
      price: 0,
      currency: "USD",
      icon: Globe,
      enabled: false,
    },
    {
      id: "email-forwarding",
      name: "Email Forwarding",
      description: "Forward emails from your domain to any email address",
      price: 0,
      currency: "USD",
      icon: Mail,
      enabled: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Available Addons
        </h3>
        <div className="space-y-3">
          {addons.map((addon) => {
            const Icon = addon.icon;
            return (
              <div
                key={addon.id}
                className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary dark:hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-2 flex-1">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {addon.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{addon.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {addon.price === 0 ? "Free" : formatCurrency(addon.price, addon.currency)}
                  </span>
                  {addon.enabled ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                      Enabled
                    </span>
                  ) : (
                    <Button size="sm" className="text-xs">
                      Enable
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
