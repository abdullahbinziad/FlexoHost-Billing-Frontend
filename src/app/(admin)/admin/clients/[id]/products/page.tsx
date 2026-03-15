"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ClientProductsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  useEffect(() => {
    if (clientId) {
      router.replace(`/admin/clients/${clientId}/hosting`);
    }
  }, [clientId, router]);

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}
