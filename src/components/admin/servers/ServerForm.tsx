"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ServerConfig } from "@/types/admin";
import { BasicInfo } from "./form/BasicInfo";
import { Nameservers } from "./form/Nameservers";
import { ModuleConfig } from "./form/ModuleConfig";
import { AccessControl } from "./form/AccessControl";
import { Save, X } from "lucide-react";

interface ServerFormProps {
    initialData?: ServerConfig;
    onSubmit: (data: Omit<ServerConfig, "id">) => void;
    onCancel?: () => void;
}

export function ServerForm({ initialData, onSubmit, onCancel }: ServerFormProps) {
    const [formData, setFormData] = useState<Omit<ServerConfig, "id">>({
        name: initialData?.name || "",
        hostname: initialData?.hostname || "",
        ipAddress: initialData?.ipAddress || "",
        assignedIpAddresses: initialData?.assignedIpAddresses || "",
        monthlyCost: initialData?.monthlyCost || 0,
        datacenter: initialData?.datacenter || "",
        maxAccounts: initialData?.maxAccounts || 200,
        statusAddress: initialData?.statusAddress || "",
        isEnabled: initialData?.isEnabled ?? true,
        location: initialData?.location || "USA",
        groups: Array.isArray(initialData?.groups) && initialData.groups.length > 0
            ? initialData.groups
            : (initialData as any)?.group ? [(initialData as any).group] : ["Web Hosting"],

        nameservers: initialData?.nameservers || {
            ns1: "ns1.flexohost.com", ns1Ip: "",
            ns2: "ns2.flexohost.com", ns2Ip: "",
            ns3: "", ns3Ip: "",
            ns4: "", ns4Ip: "",
            ns5: "", ns5Ip: "",
        },

        module: initialData?.module || {
            type: "cpanel",
            username: "root",
            password: "",
            apiToken: "",
            isSecure: true,
            port: 2087,
            isPortOverride: false,
        },

        accessControl: initialData?.accessControl || "unrestricted",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value
        }));
    };

    const handleNameserverChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            nameservers: { ...prev.nameservers, [key]: value }
        }));
    };

    const handleModuleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            module: { ...prev.module, [field]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-[1600px] space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column - Core Info */}
                <div className="lg:col-span-2 space-y-6">
                    <BasicInfo
                        formData={formData}
                        handleChange={handleChange}
                        setFormData={setFormData}
                    />
                    <ModuleConfig
                        formData={formData}
                        handleModuleChange={handleModuleChange}
                    />
                </div>

                {/* Right Column - Additional Config */}
                <div className="space-y-6">
                    <div className="flex flex-col gap-6 sticky top-6">
                        <Nameservers
                            formData={formData}
                            handleNameserverChange={handleNameserverChange}
                        />
                        <AccessControl
                            formData={formData}
                            setFormData={setFormData}
                        />

                        <div className="bg-card border rounded-lg p-4 shadow-sm">
                            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Actions</h3>
                            <div className="flex items-center justify-end gap-3">
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
