"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientBillableItemsPage() {
  const params = useParams();
  const clientId = params?.id as string;

  return (
    <Card className="border-none shadow-none">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="bg-muted p-4 rounded-full">
            <Copy className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Billable Items</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Billable items allow you to invoice customized or one-off charges to this client.
            </p>
          </div>
          <Button disabled title="Coming soon">
            <Plus className="w-4 h-4 mr-2" />
            Add Billable Item
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
