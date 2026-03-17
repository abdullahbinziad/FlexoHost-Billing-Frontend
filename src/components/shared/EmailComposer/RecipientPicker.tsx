"use client";

import { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetClientsQuery } from "@/store/api/clientApi";
import type { ClientListItem } from "@/store/api/clientApi";

export interface RecipientItem {
  id: string;
  label: string;
  email?: string;
}

interface RecipientPickerProps {
  selectedClients: RecipientItem[];
  onSelectionChange: (clients: RecipientItem[]) => void;
  maxRecipients?: number;
  disabled?: boolean;
}

function getClientLabel(c: ClientListItem) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  const email = c.contactEmail || (c.user as { email?: string })?.email;
  return name ? `${name}${email ? ` (${email})` : ""}` : email || c._id;
}

export function RecipientPicker({
  selectedClients,
  onSelectionChange,
  maxRecipients = 100,
  disabled = false,
}: RecipientPickerProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetClientsQuery({
    page,
    limit: 20,
    ...(search.trim() && { search: search.trim() }),
  });

  const clients = data?.clients ?? [];
  const pages = data?.pages ?? 1;
  const selectedIds = new Set(selectedClients.map((c) => c.id));

  const toggleSelect = (client: ClientListItem) => {
    if (disabled) return;
    const id = client._id;
    const label = getClientLabel(client);
    const email = client.contactEmail || (client.user as { email?: string })?.email;
    if (selectedIds.has(id)) {
      onSelectionChange(selectedClients.filter((c) => c.id !== id));
    } else if (selectedClients.length < maxRecipients) {
      onSelectionChange([...selectedClients, { id, label, email }]);
    }
  };

  const toggleSelectAll = () => {
    if (disabled) return;
    const visibleIds = new Set(clients.map((c) => c._id));
    const allSelected = clients.every((c) => selectedIds.has(c._id));
    if (allSelected) {
      const toRemove = new Set(clients.map((c) => c._id));
      onSelectionChange(selectedClients.filter((c) => !toRemove.has(c.id)));
    } else {
      const toAdd = clients.filter((c) => !selectedIds.has(c._id));
      const added: RecipientItem[] = toAdd
        .slice(0, maxRecipients - selectedClients.length)
        .map((c) => ({
          id: c._id,
          label: getClientLabel(c),
          email: c.contactEmail || (c.user as { email?: string })?.email,
        }));
      onSelectionChange([...selectedClients, ...added]);
    }
  };

  const removeSelected = (id: string) => {
    onSelectionChange(selectedClients.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name, email, company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {selectedClients.length} recipient{selectedClients.length !== 1 ? "s" : ""} selected
        {maxRecipients < 100 && ` (max ${maxRecipients})`}
      </div>

      {selectedClients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedClients.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-sm"
            >
              {c.label}
              <button
                type="button"
                onClick={() => removeSelected(c.id)}
                className="hover:bg-muted-foreground/20 rounded p-0.5"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="border rounded-md max-h-[200px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : clients.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No clients found. Try a different search.
          </div>
        ) : (
          <div className="divide-y">
            <div className="flex items-center gap-2 p-2 bg-muted/50 sticky top-0">
              <Checkbox
                checked={
                  clients.length > 0 &&
                  clients.every((c) => selectedIds.has(c._id))
                }
                onCheckedChange={toggleSelectAll}
                disabled={disabled}
              />
              <span className="text-xs font-medium">Select all on this page</span>
            </div>
            {clients.map((client) => (
              <label
                key={client._id}
                className="flex items-center gap-2 p-2 hover:bg-muted/30 cursor-pointer"
              >
                <Checkbox
                  checked={selectedIds.has(client._id)}
                  onCheckedChange={() => toggleSelect(client)}
                  disabled={
                    disabled ||
                    (!selectedIds.has(client._id) && selectedIds.size >= maxRecipients)
                  }
                />
                <span className="text-sm truncate flex-1">
                  {getClientLabel(client)}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
