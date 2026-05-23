"use client";

import { Loader2, Plus, Save, Server, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DomainNameserversCardProps {
  nameservers: string[];
  isSaving: boolean;
  error?: unknown;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSave: () => void;
}

export function DomainNameserversCard({
  nameservers,
  isSaving,
  error,
  onChange,
  onAdd,
  onRemove,
  onSave,
}: DomainNameserversCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Server className="w-4 h-4 text-gray-500" />
          Nameservers
        </CardTitle>
        <Button size="sm" variant="outline" onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">Failed to load live domain details.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nameservers.map((value, index) => (
                <div key={`${index}-${index + 1}`} className="relative flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">NS{index + 1}</span>
                    <Input
                      className="pl-12"
                      placeholder={`Nameserver ${index + 1}`}
                      value={value}
                      onChange={(event) => onChange(index, event.target.value)}
                    />
                  </div>
                  {nameservers.length > 2 ? (
                    <Button type="button" variant="outline" size="icon" onClick={() => onRemove(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Nameserver
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
