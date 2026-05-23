"use client";

import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface DomainAdminNotesCardProps {
  notes: string;
  isSaving: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
}

export function DomainAdminNotesCard({ notes, isSaving, onChange, onSave }: DomainAdminNotesCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Admin Notes</CardTitle>
        <Button size="sm" variant="outline" onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Notes
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Add private notes about this domain..."
          className="min-h-[100px]"
          value={notes}
          onChange={(event) => onChange(event.target.value)}
        />
      </CardContent>
    </Card>
  );
}
