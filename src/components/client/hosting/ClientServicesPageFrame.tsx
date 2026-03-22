"use client";

interface ClientServicesPageFrameProps {
  isLoading: boolean;
  isProfileLoading: boolean;
  noClient: boolean;
  loadingMessage?: string;
  noClientMessage?: string;
  children: React.ReactNode;
}

const DEFAULT_LOADING = "Loading...";
const DEFAULT_NO_CLIENT = "Client profile not found. Please complete your profile.";

/**
 * Shared frame for client service list pages: shows loading or no-client state, otherwise children.
 */
export function ClientServicesPageFrame({
  isLoading,
  isProfileLoading,
  noClient,
  loadingMessage = DEFAULT_LOADING,
  noClientMessage = DEFAULT_NO_CLIENT,
  children,
}: ClientServicesPageFrameProps) {
  if (isProfileLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500 dark:text-gray-400">{loadingMessage}</p>
      </div>
    );
  }

  if (noClient) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500 dark:text-gray-400">{noClientMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
