"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import type { DomainDetails } from "@/types/domain-manage";

interface NameserversModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainDetails;
  onSave?: (nameservers: string[]) => void;
}

export function NameserversModal({
  isOpen,
  onClose,
  domain,
  onSave,
}: NameserversModalProps) {
  const [useDefaultNameservers, setUseDefaultNameservers] = useState(false);
  const [nameservers, setNameservers] = useState<string[]>([
    domain.nameservers?.[0] || "",
    domain.nameservers?.[1] || "",
    domain.nameservers?.[2] || "",
    domain.nameservers?.[3] || "",
  ]);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const validateNameservers = (): boolean => {
    const newErrors: { [key: number]: string } = {};
    
    if (!useDefaultNameservers) {
      if (!nameservers[0]?.trim()) {
        newErrors[0] = "This field is required!";
      }
      if (!nameservers[1]?.trim()) {
        newErrors[1] = "This field is required!";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameserverChange = (index: number, value: string) => {
    const updated = [...nameservers];
    updated[index] = value;
    setNameservers(updated);
    
    // Clear error when user starts typing
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const handleSave = () => {
    if (useDefaultNameservers) {
      // Use default nameservers (empty array or default values)
      onSave?.([]);
      onClose();
      return;
    }

    if (!validateNameservers()) {
      return;
    }

    // Filter out empty nameservers
    const validNameservers = nameservers.filter((ns) => ns.trim());
    onSave?.(validNameservers);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Nameservers" size="lg">
      <div className="space-y-6">
        {/* Radio Button Options */}
        <div className="space-y-4">
          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              type="radio"
              name="nameserver-option"
              checked={useDefaultNameservers}
              onChange={() => setUseDefaultNameservers(true)}
              className="mt-1 w-4 h-4 text-primary border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-2"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Use FlexoHost nameservers (recommended)
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              type="radio"
              name="nameserver-option"
              checked={!useDefaultNameservers}
              onChange={() => setUseDefaultNameservers(false)}
              className="mt-1 w-4 h-4 text-primary border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-2"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Change nameservers
              </span>
            </div>
          </label>
        </div>

        {/* Nameserver Input Fields */}
        {!useDefaultNameservers && (
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nameserver {index + 1}
                  {(index === 0 || index === 1) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={nameservers[index] || ""}
                  onChange={(e) => handleNameserverChange(index, e.target.value)}
                  placeholder={`Nameserver ${index + 1}`}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                    errors[index]
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                />
                {errors[index] && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors[index]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
