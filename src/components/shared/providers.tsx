"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LoaderProvider, useLoader } from "@/contexts/LoaderContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalLoader } from "@/components/shared/GlobalLoader";
import { Toaster } from "sonner";

function LoaderWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, loadingMessage } = useLoader();

  return (
    <>
      {isLoading && <GlobalLoader fullScreen text={loadingMessage} />}
      {children}
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Provider store={store}>
          <SidebarProvider>
            <LoaderProvider>
              <LoaderWrapper>{children}</LoaderWrapper>
              <Toaster position="top-right" richColors closeButton />
            </LoaderProvider>
          </SidebarProvider>
        </Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}
