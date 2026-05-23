"use client";

import { RegistrarConfigCard } from "@/components/admin/domain-settings/RegistrarConfigCard";
import {
    useGetAdminRegistrarConfigsQuery,
    useUpdateAdminRegistrarConfigMutation,
} from "@/store/api/domainApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function registrarErrorMessage(error: unknown): string {
    if (error && typeof error === "object") {
        const e = error as { data?: { message?: string }; status?: number };
        if (typeof e.data?.message === "string") return e.data.message;
        if (typeof (error as Error).message === "string") return (error as Error).message;
    }
    return "Failed to load registrar configuration.";
}

export default function DomainRegisterConfig() {
    const { data: registrars = [], isLoading, isError, error, refetch, isFetching } =
        useGetAdminRegistrarConfigsQuery();
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
            <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm">
                <p className="font-medium text-destructive">{registrarErrorMessage(error)}</p>
                <p className="text-muted-foreground">
                    Ensure you are signed in as admin or staff and your role can access{" "}
                    <code className="rounded bg-muted px-1">GET /api/v1/domains/admin/registrars</code>.
                </p>
                <button
                    type="button"
                    className="text-primary underline underline-offset-2"
                    onClick={() => void refetch()}
                >
                    Retry
                </button>
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

            {registrars.length === 0 && !isFetching ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    <p>No registrar definitions were returned.</p>
                    <p className="mt-2">
                        If this persists after refresh, check the API response for{" "}
                        <code className="rounded bg-muted px-1">/domains/admin/registrars</code> (expect a JSON array
                        in <code className="rounded bg-muted px-1">data</code>).
                    </p>
                    <button
                        type="button"
                        className="mt-4 text-primary underline underline-offset-2"
                        onClick={() => void refetch()}
                    >
                        Reload
                    </button>
                </div>
            ) : null}

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
