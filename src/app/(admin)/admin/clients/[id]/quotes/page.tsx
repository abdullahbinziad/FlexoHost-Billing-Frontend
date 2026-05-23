"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientQuotesPage() {
  const params = useParams();
  const clientId = params?.id as string;

  return (
    <Card className="border-none shadow-none">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="bg-muted p-4 rounded-full">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Quotes Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create a quote to send a custom price estimate to this client. Quotes can be converted to invoices later.
            </p>
          </div>
          <Button disabled title="Coming soon">
            <Plus className="w-4 h-4 mr-2" />
            Create New Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
