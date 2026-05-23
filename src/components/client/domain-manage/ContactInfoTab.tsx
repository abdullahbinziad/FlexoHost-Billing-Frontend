"use client";

import { useState } from "react";
import { User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DomainDetails, ContactInfo } from "@/types/domain-manage";

interface ContactInfoTabProps {
  domain: DomainDetails;
  onContactChange?: (contactType: string, contact: ContactInfo) => void;
}

export function ContactInfoTab({ domain, onContactChange }: ContactInfoTabProps) {
  const [activeContact, setActiveContact] = useState<"registrant" | "admin" | "tech" | "billing">(
    "registrant"
  );
  const [contact, setContact] = useState<ContactInfo>(domain.contacts[activeContact]);

  const handleContactTypeChange = (type: "registrant" | "admin" | "tech" | "billing") => {
    setActiveContact(type);
    setContact(domain.contacts[type]);
  };

  const handleFieldChange = (field: keyof ContactInfo, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onContactChange?.(activeContact, contact);
    // TODO: Show success message
  };

  const contactTypes = [
    { id: "registrant", label: "Registrant" },
    { id: "admin", label: "Administrative" },
    { id: "tech", label: "Technical" },
    { id: "billing", label: "Billing" },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Contact Information
        </h3>

        {/* Contact Type Selector */}
        <div className="flex gap-2 mb-4">
          {contactTypes.map((type) => (
            <Button
              key={type.id}
              variant={activeContact === type.id ? "default" : "secondary"}
              size="sm"
              onClick={() => handleContactTypeChange(type.id)}
            >
              {type.label}
            </Button>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={contact.firstName}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={contact.lastName}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <input
              type="text"
              value={contact.address}
              onChange={(e) => handleFieldChange("address", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <input
              type="text"
              value={contact.city}
              onChange={(e) => handleFieldChange("city", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State
            </label>
            <input
              type="text"
              value={contact.state}
              onChange={(e) => handleFieldChange("state", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              value={contact.zipCode}
              onChange={(e) => handleFieldChange("zipCode", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <input
              type="text"
              value={contact.country}
              onChange={(e) => handleFieldChange("country", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="mt-4 w-full"
        >
          <Save className="w-4 h-4" />
          Save {contactTypes.find((t) => t.id === activeContact)?.label} Contact
        </Button>
      </div>
    </div>
  );
}
