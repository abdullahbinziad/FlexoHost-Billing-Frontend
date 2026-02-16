"use client";

import { CouponForm } from "@/components/admin/promotions/CouponForm";
import { PageHeader } from "@/components/ui/page-header";
import { Coupon } from "@/types/admin";
import { useRouter } from "next/navigation";

export default function NewPromotionPage() {
    const router = useRouter();

    const handleSubmit = (data: Omit<Coupon, "id" | "uses" | "status">) => {
        console.log("New promotion data:", data);
        // Todo: Implement API call to create promotion
        alert("Promotion created successfully (mock)");
        router.push("/admin/promotions");
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
                    { label: "Create New" }
                ]}
                backHref="/admin/promotions"
            />

            <CouponForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    );
}
