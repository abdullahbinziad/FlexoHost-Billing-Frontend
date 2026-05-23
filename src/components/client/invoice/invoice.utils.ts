/**
 * Invoice utility functions
 */

export function formatInvoiceDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getInvoiceStatusStyles(status: string): string {
  const statusMap: Record<string, string> = {
    paid: "bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100 border-green-300 dark:border-green-700 shadow-green-200/50 dark:shadow-green-900/30",
    unpaid: "bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700 shadow-red-200/50 dark:shadow-red-900/30",
    pending: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-700 shadow-yellow-200/50 dark:shadow-yellow-900/30",
    cancelled: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 shadow-gray-200/50 dark:shadow-gray-900/30",
  };
  return statusMap[status] ?? statusMap.cancelled;
}

export function formatInvoicedAddress(address: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}): string {
  const parts = [address.street, address.city, address.state, address.zipCode].filter(Boolean);
  const line1 = parts.join(", ");
  if (!line1 && !address.country) return "—";
  if (!line1) return address.country;
  return address.country ? `${line1} • ${address.country}` : line1;
}
