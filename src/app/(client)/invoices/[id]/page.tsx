"use client";

import { useParams } from "next/navigation";
import { InvoiceDetail } from "@/components/client/invoice";
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
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-primary sm:h-12 sm:w-12" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:min-h-screen">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
            Invoice Not Found
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            The requested invoice could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const invoice = mapInvoiceApiToFrontend(data);

  return <InvoiceDetail invoice={invoice} />;
}
