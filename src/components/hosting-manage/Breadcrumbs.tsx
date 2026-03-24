  "use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-2">
      <ol className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index === 0 && (
              <Link
                href={item.href || "/client"}
                className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-2"
              >
                <Home className="w-3 h-3" />
                <span>{item.label}</span>
              </Link>
            )}
            {index > 0 && (
              <>
                <ChevronRight className="w-3 h-3" />
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
