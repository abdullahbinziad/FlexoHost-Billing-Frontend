"use client";

import { PromotionForm } from "@/components/admin/promotions/PromotionForm";
import { PageHeader } from "@/components/ui/page-header";
import { useGetPromotionQuery, useUpdatePromotionMutation } from "@/store/api/promotionApi";
import type { CreatePromotionDTO } from "@/types/admin/coupon";
import { useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";

export default function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const { data: promotion, isLoading, error } = useGetPromotionQuery(id);
    const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();

    const handleSubmit = async (data: CreatePromotionDTO) => {
        try {
            await updatePromotion({ id, data }).unwrap();
            toast.success("Promotion updated successfully");
            router.push("/admin/promotions");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update promotion");
        }
    };

    const handleCancel = () => {
        router.push("/admin/promotions");
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Edit Promotion"
                    description="Loading..."
                    breadcrumbs={[{ label: "Promotions", href: "/admin/promotions" }, { label: "Edit" }]}
                    backHref="/admin/promotions"
                />
                <div className="py-12 text-center text-muted-foreground">Loading promotion...</div>
            </div>
        );
    }

    if (error || !promotion) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Edit Promotion"
                    description="Promotion not found"
                    breadcrumbs={[{ label: "Promotions", href: "/admin/promotions" }, { label: "Edit" }]}
                    backHref="/admin/promotions"
                />
                <div className="py-12 text-center text-destructive">
                    Promotion not found or failed to load.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Edit Promotion: ${promotion.code}`}
                description="Update promotional code settings."
                breadcrumbs={[
                    { label: "Promotions", href: "/admin/promotions" },
                    { label: promotion.code },
                ]}
                backHref="/admin/promotions"
            />

            <PromotionForm
                initialData={promotion}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isUpdating}
            />
        </div>
    );
}
