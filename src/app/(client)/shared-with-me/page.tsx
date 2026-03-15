"use client";

import { useGetGrantsSharedWithMeQuery } from "@/store/api/accessGrantsApi";
import { Loader2, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SharedClientCard } from "@/features/shared-with-me";

export default function SharedWithMePage() {
  const { data: grants = [], isLoading } = useGetGrantsSharedWithMeQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Share2 className="w-8 h-8" />
          Shared with me
        </h1>
        <p className="text-muted-foreground mt-1">
          Clients who have granted you access to manage their services. Select one to view and manage allowed services.
        </p>
      </header>

      {grants.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">
              No one has shared access with you yet. When a client grants you access, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {grants.map((g) => (
            <li key={g._id}>
              <SharedClientCard grant={g} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
