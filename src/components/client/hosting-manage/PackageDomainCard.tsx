"use client";

import Link from "next/link";
import { ExternalLink, Globe } from "lucide-react";
import type { HostingServiceDetails } from "@/types/hosting-manage";

interface PackageDomainCardProps {
  service: HostingServiceDetails;
}

export function PackageDomainCard({ service }: PackageDomainCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Package/Domain
      </h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Package</p>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100">
            {service.packageName}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Domain</p>
          <div className="flex items-center gap-2">
            <Link
              href={`https://${service.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-medium flex items-center gap-2"
            >
              www.{service.domain}
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <a
            href={`https://${service.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-center"
          >
            Visit Website
          </a>
          <Link
            href={`/domains?domain=${service.domain}`}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors text-center"
          >
            Manage Domain
          </Link>
        </div>
      </div>
    </div>
  );
}
