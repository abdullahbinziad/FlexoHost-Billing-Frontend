"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMounted: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Initialize from localStorage after mount
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      try {
        setIsCollapsed(JSON.parse(stored));
      } catch {
        // Invalid stored value, use default
        setIsCollapsed(false);
      }
    }
  }, []);

  // Save to localStorage when collapsed state changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isMounted]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, isMounted }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
