"use client";

import { createContext, useContext, useMemo, useRef, useState, ReactNode } from "react";

interface LoaderContextType {
  isLoading: boolean;
  setLoading: (loading: boolean, message?: string) => void;
  startLoading: (message?: string) => string;
  stopLoading: (id: string) => void;
  loadingMessage: string;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const activeLoadersRef = useRef(new Set<string>());

  const setLoading = (loading: boolean, message?: string) => {
    // Backward-compatible helper for existing callers.
    if (loading) {
      const id = `legacy:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
      activeLoadersRef.current.add(id);
      setLoadingMessage(message || "");
      setIsLoading(true);
      return;
    }
    activeLoadersRef.current.clear();
    setIsLoading(false);
    setLoadingMessage("");
  };

  const startLoading = (message?: string): string => {
    const id = `${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
    activeLoadersRef.current.add(id);
    if (message) setLoadingMessage(message);
    setIsLoading(true);
    return id;
  };

  const stopLoading = (id: string) => {
    activeLoadersRef.current.delete(id);
    if (activeLoadersRef.current.size === 0) {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const value = useMemo(
    () => ({ isLoading, setLoading, startLoading, stopLoading, loadingMessage }),
    [isLoading, loadingMessage]
  );

  return (
    <LoaderContext.Provider value={value}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
}
