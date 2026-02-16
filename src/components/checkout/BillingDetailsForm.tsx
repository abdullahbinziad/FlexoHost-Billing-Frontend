"use client";

import { cn } from "@/lib/utils";
import type { BillingContact } from "@/types/checkout";

interface BillingDetailsFormProps {
  contacts: BillingContact[];
  selectedContactId: string;
  onSelect: (contactId: string) => void;
  onCreateNew?: () => void;
}

export function BillingDetailsForm({
  contacts,
  selectedContactId,
  onSelect,
  onCreateNew,
}: BillingDetailsFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Billing Details</h2>
      <div className="space-y-3">
        {contacts.map((contact) => {
          const isSelected = selectedContactId === contact.id;

          return (
            <label
              key={contact.id}
              className={cn(
                "flex items-start gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                isSelected
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              )}
            >
              <div className="relative flex items-center mt-1">
                <input
                  type="radio"
                  name="billing-contact"
                  checked={isSelected}
                  onChange={() => onSelect(contact.id)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                  )}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {contact.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{contact.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {contact.address.street}, {contact.address.city},{" "}
                  {contact.address.state} {contact.address.zipCode}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {contact.address.country}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{contact.phone}</p>
                {contact.currency && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                    {contact.currency}
                  </span>
                )}
              </div>
            </label>
          );
        })}

        {/* Create New Account Option */}
        {onCreateNew && (
          <label
            className={cn(
              "flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
              "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            )}
          >
            <div className="relative flex items-center">
              <input
                type="radio"
                name="billing-contact"
                checked={false}
                onChange={onCreateNew}
                className="sr-only"
              />
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Create a New Account
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
