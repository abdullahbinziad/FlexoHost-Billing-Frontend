"use client";

import { useParams } from "next/navigation";
import { InvoiceDetail } from "@/components/invoice";
import { useGetInvoiceByIdQuery } from "@/store/api/invoiceApi";
import { mapInvoiceApiToFrontend } from "@/lib/mappers";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const { data, isLoading, error } = useGetInvoiceByIdQuery(invoiceId, {
    skip: !invoiceId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Invoice Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested invoice could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const invoice = mapInvoiceApiToFrontend(data);

  return <InvoiceDetail invoice={invoice} />;
}
