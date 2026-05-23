"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarHeader({
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarHeaderProps) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "h-16 flex items-center border-b border-gray-200 dark:border-gray-800",
        isCollapsed ? "justify-center px-0" : "justify-between px-6"
      )}
    >
      {!isCollapsed && (
        <Link href="/" className="flex items-center">
          <Image
            src={
              theme === "dark"
                ? "/img/company/FlexoHostHorizontalforDark.webp"
                : "/img/company/FlexoHostHorizontalforLight.webp"
            }
            alt="FlexoHost Logo"
            width={150}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>
      )}

      <div className="flex items-center gap-2">
        {/* Desktop Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="hidden lg:flex"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>

        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
