"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, StickyNote } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ClientNotesPage() {
  const params = useParams();
  const clientId = params?.id as string;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">Staff Notes</CardTitle>
          <p className="text-sm text-muted-foreground">Internal notes for this client (coming soon)</p>
        </div>
        <Button disabled title="Coming soon">
          <Plus className="w-4 h-4 mr-2" />
          Add New Note
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 rounded-lg border border-dashed bg-muted/30">
          <div className="bg-muted p-4 rounded-full">
            <StickyNote className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Notes Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Staff notes for this client will appear here once the feature is available.
            </p>
          </div>
          <Button variant="outline" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
