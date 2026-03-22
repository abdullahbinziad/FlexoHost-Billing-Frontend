"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SidebarSection } from "@/types/hosting-manage";

interface ManageSidebarProps {
  sections: SidebarSection[];
  activeItemId?: string;
}

export function ManageSidebar({ sections, activeItemId }: ManageSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const isCollapsible = section.collapsible !== false;

          return (
            <div key={section.id} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
              {isCollapsible ? (
                <Button
                  variant="ghost"
                  onClick={() => toggleSection(section.id)}
                  className="w-full justify-between"
                >
                  <span className="text-sm font-semibold">
                    {section.title}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              ) : (
                <div className="px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {section.title}
                  </span>
                </div>
              )}

              {(!isCollapsible || isExpanded) && (
                <div className="pb-2">
                  {section.items.map((item) => {
                    const isActive = activeItemId === item.id || item.active;

                    if (item.href) {
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={cn(
                            "block px-4 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    }

                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "secondary" : "ghost"}
                        onClick={item.onClick}
                        className="w-full justify-start"
                        size="sm"
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
