"use client";

import { RegistrarConfigCard } from "@/components/admin/domain-settings/RegistrarConfigCard";
import {
    useGetAdminRegistrarConfigsQuery,
    useUpdateAdminRegistrarConfigMutation,
} from "@/store/api/domainApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DomainRegisterConfig() {
    const { data: registrars = [], isLoading, isError } = useGetAdminRegistrarConfigsQuery();
    const [updateRegistrarConfig, { isLoading: isSaving }] = useUpdateAdminRegistrarConfigMutation();

    const handleSave = async (payload: {
        registrarKey: string;
        isActive: boolean;
        settings: Record<string, string | boolean | null>;
    }) => {
        try {
            const result = await updateRegistrarConfig(payload).unwrap();
            toast.success(`${result.name} configuration updated`);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update registrar configuration");
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-sm text-destructive">
                Failed to load registrar configuration.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
                    Domain Registrars
                </h2>
            </div>

            <div className="space-y-4">
                {registrars.map((registrar) => (
                    <RegistrarConfigCard
                        key={registrar.key}
                        registrarKey={registrar.key}
                        name={registrar.name}
                        logoText={registrar.logoText}
                        description={registrar.description}
                        implemented={registrar.implemented}
                        isActive={registrar.isActive}
                        isSaving={isSaving}
                        onSave={handleSave}
                        configFields={registrar.configFields}
                    />
                ))}
            </div>
        </div>
    );
}
