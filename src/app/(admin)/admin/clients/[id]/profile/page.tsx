"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetClientByIdQuery, useUpdateClientMutation } from "@/store/api/clientApi";
import type { ClientListItem } from "@/store/api/clientApi";

function formatAddress(client: ClientListItem | undefined): string {
  if (!client?.address) return "";
  const a = client.address as { street?: string; city?: string; state?: string; postCode?: string; country?: string };
  const parts = [a.street, a.city, a.state, a.postCode, a.country].filter(Boolean);
  return parts.join(", ");
}

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params?.id as string;
  const { data: client, isLoading, error } = useGetClientByIdQuery(clientId, { skip: !clientId });
  const [updateClient, { isLoading: isSaving }] = useUpdateClientMutation();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    contactEmail: "",
    phoneNumber: "",
    addressStr: "",
  });

  useEffect(() => {
    if (client) {
      const a = client.address as { street?: string; city?: string; state?: string; postCode?: string; country?: string } | undefined;
      setForm({
        firstName: client.firstName ?? "",
        lastName: client.lastName ?? "",
        companyName: client.companyName ?? "",
        contactEmail: client.contactEmail ?? (client.user as { email?: string })?.email ?? "",
        phoneNumber: client.phoneNumber ?? "",
        addressStr: a ? [a.street, a.city, a.state, a.postCode, a.country].filter(Boolean).join(", ") : "",
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    const parts = form.addressStr.split(",").map((s) => s.trim());
    await updateClient({
      id: clientId,
      data: {
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        companyName: form.companyName || undefined,
        contactEmail: form.contactEmail || undefined,
        phoneNumber: form.phoneNumber || undefined,
        address:
          parts.length > 0
            ? {
                street: parts[0] || undefined,
                city: parts[1] || undefined,
                state: parts[2] || undefined,
                postCode: parts[3] || undefined,
                country: parts[4] ?? parts[3] ?? undefined,
              }
            : undefined,
      },
    }).unwrap();
  };

  if (isLoading || !clientId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading profile...</CardContent>
      </Card>
    );
  }
  if (error || !client) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">Failed to load client.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={form.phoneNumber}
                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={form.addressStr}
              onChange={(e) => setForm((p) => ({ ...p, addressStr: e.target.value }))}
              placeholder="Street, City, State, Post Code, Country"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!client) return;
                const a = client.address as { street?: string; city?: string; state?: string; postCode?: string; country?: string } | undefined;
                setForm({
                  firstName: client.firstName ?? "",
                  lastName: client.lastName ?? "",
                  companyName: client.companyName ?? "",
                  contactEmail: client.contactEmail ?? (client.user as { email?: string })?.email ?? "",
                  phoneNumber: client.phoneNumber ?? "",
                  addressStr: a ? [a.street, a.city, a.state, a.postCode, a.country].filter(Boolean).join(", ") : "",
                });
              }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
