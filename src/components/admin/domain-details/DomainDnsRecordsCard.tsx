"use client";

import { Loader2, Plus, Save, Server, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import type { DomainDnsRecord } from "@/store/api/domainApi";

interface DomainDnsRecordsCardProps {
  records: DomainDnsRecord[];
  paginatedRecords: DomainDnsRecord[];
  recordTypes: DomainDnsRecord["type"][];
  page: number;
  pageSize: number;
  isLoading: boolean;
  isSaving: boolean;
  error?: unknown;
  onChange: (index: number, field: keyof DomainDnsRecord, value: string | number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSave: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function DomainDnsRecordsCard({
  records,
  paginatedRecords,
  recordTypes,
  page,
  pageSize,
  isLoading,
  isSaving,
  error,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onPageChange,
  onPageSizeChange,
}: DomainDnsRecordsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Server className="w-4 h-4 text-gray-500" />
          DNS Records
        </CardTitle>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>
          <Button size="sm" variant="outline" onClick={onSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save DNS
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">Failed to load DNS records.</p>
        ) : (
          paginatedRecords.map((record, pageIndex) => {
            const index = (page - 1) * pageSize + pageIndex;
            return (
              <div key={`${record.type}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-lg border p-4">
                <div className="md:col-span-2">
                  <Select value={record.type} onValueChange={(value) => onChange(index, "type", value as DomainDnsRecord["type"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Input placeholder="Host" value={record.name ?? ""} onChange={(event) => onChange(index, "name", event.target.value)} />
                </div>
                <div className="md:col-span-4">
                  <Input placeholder="Value" value={record.value} onChange={(event) => onChange(index, "value", event.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Input
                    placeholder="TTL"
                    type="number"
                    value={record.ttl ?? ""}
                    onChange={(event) => onChange(index, "ttl", Number(event.target.value) || 0)}
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    placeholder="Prio"
                    type="number"
                    value={record.priority ?? ""}
                    onChange={(event) => onChange(index, "priority", Number(event.target.value) || 0)}
                  />
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <Button type="button" variant="outline" size="icon" onClick={() => onRemove(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
        {!error ? (
          <DataTablePagination
            page={page}
            totalPages={Math.ceil(records.length / pageSize) || 1}
            totalItems={records.length}
            pageSize={pageSize}
            currentCount={paginatedRecords.length}
            itemLabel="DNS records"
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
