"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface RegistrarConfigProps {
    registrarKey: string;
    name: string;
    logoText?: string;
    description: string;
    implemented: boolean;
    isActive: boolean;
    isSaving?: boolean;
    onSave: (payload: {
        registrarKey: string;
        isActive: boolean;
        settings: Record<string, string | boolean | null>;
    }) => Promise<void> | void;
    configFields: {
        label: string;
        type: "text" | "password" | "checkbox" | "textarea";
        value: string | boolean;
        helperText?: string;
        placeholder?: string;
        hasValue?: boolean;
        key: string;
    }[];
}

export function RegistrarConfigCard({
    registrarKey,
    name,
    logoText,
    description,
    implemented,
    isActive,
    isSaving = false,
    onSave,
    configFields,
}: RegistrarConfigProps) {
    const [isConfiguring, setIsConfiguring] = useState(isActive);
    const [activeState, setActiveState] = useState(isActive);
    const [fields, setFields] = useState(configFields);

    useEffect(() => {
        setFields(configFields);
    }, [configFields]);

    useEffect(() => {
        setActiveState(isActive);
        setIsConfiguring(isActive);
    }, [isActive]);

    const handleFieldChange = (key: string, value: string | boolean) => {
        setFields((current) => current.map((f) => (f.key === key ? { ...f, value } : f)));
    };

    const handleSave = async () => {
        const settings = fields.reduce<Record<string, string | boolean | null>>((acc, field) => {
            acc[field.key] = field.type === "checkbox" ? Boolean(field.value) : String(field.value ?? "");
            return acc;
        }, {});

        await onSave({
            registrarKey,
            isActive: activeState,
            settings,
        });
    };

    return (
        <div className="border rounded-md overflow-hidden bg-white dark:bg-gray-900 shadow-sm mb-6">
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between px-4 py-3",
                activeState ? "bg-[#e8f5e9] dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"
            )}>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-10 bg-white dark:bg-gray-800 border flex items-center justify-center font-bold text-teal-500 text-lg rounded px-2">
                        {logoText || name}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                            » {name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {description}
                        </div>
                        {!implemented ? (
                            <div className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                Coming soon: provider actions are not implemented yet.
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Checkbox
                            checked={activeState}
                            disabled={!implemented || isSaving}
                            onCheckedChange={(checked) => {
                                setActiveState(Boolean(checked));
                                if (checked) {
                                    setIsConfiguring(true);
                                }
                            }}
                        />
                        Active
                    </label>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={!activeState || isSaving}
                        onClick={() => setIsConfiguring(!isConfiguring)}
                        className="bg-white dark:bg-gray-800 h-8"
                    >
                        Configure
                    </Button>
                </div>
            </div>

            {/* Configuration Form */}
            {isConfiguring && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="bg-white dark:bg-gray-900 border rounded-sm">
                        {fields.map((field, index) => (
                            <div key={field.key} className={cn(
                                "flex flex-col md:flex-row md:items-center p-3 gap-3",
                                index !== fields.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
                            )}>
                                <div className="md:w-48 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {field.label}
                                </div>
                                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                                    {field.type === "checkbox" ? (
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={field.value as boolean}
                                                onCheckedChange={(c) => handleFieldChange(field.key, !!c)}
                                            />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{field.helperText}</span>
                                        </div>
                                    ) : field.type === "textarea" ? (
                                        <>
                                            <textarea
                                                value={field.value as string}
                                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                            {field.helperText && <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">{field.helperText}</span>}
                                        </>
                                    ) : (
                                        <>
                                            <Input
                                                type={field.type}
                                                value={field.value as string}
                                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                placeholder={field.hasValue ? "Saved value" : field.placeholder}
                                                className="max-w-md h-8"
                                            />
                                            {field.helperText && <span className="text-xs text-gray-500 dark:text-gray-500">{field.helperText}</span>}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-4">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleSave}
                            disabled={isSaving || (!implemented && activeState)}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
