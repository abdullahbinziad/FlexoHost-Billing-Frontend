"use client";

import { PromotionForm } from "@/components/admin/promotions/PromotionForm";
import { PageHeader } from "@/components/ui/page-header";
import { useCreatePromotionMutation } from "@/store/api/promotionApi";
import type { CreatePromotionDTO } from "@/types/admin/coupon";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewPromotionPage() {
    const router = useRouter();
    const [createPromotion, { isLoading }] = useCreatePromotionMutation();

    const handleSubmit = async (data: CreatePromotionDTO) => {
        try {
            await createPromotion(data).unwrap();
            toast.success("Promotion created successfully");
            router.push("/admin/promotions");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to create promotion");
        }
    };

    const handleCancel = () => {
        router.push("/admin/promotions");
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Create New Promotion"
                description="Set up a new promotional code for your customers."
                breadcrumbs={[
                    { label: "Promotions", href: "/admin/promotions" },
                    { label: "Create New" },
                ]}
                backHref="/admin/promotions"
            />

            <PromotionForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isLoading}
            />
        </div>
    );
}
