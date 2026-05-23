"use client";

import { Loader2, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DomainContact, DomainContactDetails } from "@/store/api/domainApi";

const CONTACT_SECTIONS: Array<{ key: keyof DomainContactDetails; label: string }> = [
  { key: "registrant", label: "Registrant" },
  { key: "admin", label: "Admin" },
  { key: "tech", label: "Technical" },
  { key: "billing", label: "Billing" },
];

interface DomainContactTabsCardProps {
  contacts: DomainContactDetails;
  isLoading: boolean;
  isSaving: boolean;
  error?: unknown;
  onChange: (section: keyof DomainContactDetails, field: keyof DomainContact, value: string) => void;
  onSave: () => void;
}

export function DomainContactTabsCard({
  contacts,
  isLoading,
  isSaving,
  error,
  onChange,
  onSave,
}: DomainContactTabsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            Contact Information
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Loaded from the registrar. Saving updates the registrar first, then refreshes the local snapshot.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onSave} disabled={isSaving || isLoading}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Contacts
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">Failed to load registrar contact details.</p>
        ) : (
          <Tabs defaultValue="registrant" className="space-y-4">
            <TabsList className="flex h-auto flex-wrap gap-1 p-1">
              {CONTACT_SECTIONS.map((section) => (
                <TabsTrigger key={section.key} value={section.key}>
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {CONTACT_SECTIONS.map((section) => (
              <TabsContent key={section.key} value={section.key}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Contact name"
                    value={contacts[section.key].name ?? ""}
                    onChange={(event) => onChange(section.key, "name", event.target.value)}
                  />
                  <Input
                    placeholder="Organization"
                    value={contacts[section.key].organization ?? ""}
                    onChange={(event) => onChange(section.key, "organization", event.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    value={contacts[section.key].email ?? ""}
                    onChange={(event) => onChange(section.key, "email", event.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Code"
                      value={contacts[section.key].phonecc ?? ""}
                      onChange={(event) => onChange(section.key, "phonecc", event.target.value)}
                    />
                    <div className="col-span-2">
                      <Input
                        placeholder="Phone number"
                        value={contacts[section.key].phonenum ?? ""}
                        onChange={(event) => onChange(section.key, "phonenum", event.target.value)}
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Address line 1"
                    value={contacts[section.key].address1 ?? ""}
                    onChange={(event) => onChange(section.key, "address1", event.target.value)}
                  />
                  <Input
                    placeholder="Address line 2"
                    value={contacts[section.key].address2 ?? ""}
                    onChange={(event) => onChange(section.key, "address2", event.target.value)}
                  />
                  <Input
                    placeholder="City"
                    value={contacts[section.key].city ?? ""}
                    onChange={(event) => onChange(section.key, "city", event.target.value)}
                  />
                  <Input
                    placeholder="State / Region"
                    value={contacts[section.key].state ?? ""}
                    onChange={(event) => onChange(section.key, "state", event.target.value)}
                  />
                  <Input
                    placeholder="Postal code"
                    value={contacts[section.key].zip ?? ""}
                    onChange={(event) => onChange(section.key, "zip", event.target.value)}
                  />
                  <Input
                    placeholder="Country"
                    value={contacts[section.key].country ?? ""}
                    onChange={(event) => onChange(section.key, "country", event.target.value)}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
