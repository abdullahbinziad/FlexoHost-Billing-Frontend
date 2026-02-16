"use client";

import { CouponForm } from "@/components/admin/promotions/CouponForm";
import { PageHeader } from "@/components/ui/page-header";
import { Coupon } from "@/types/admin";
import { useRouter } from "next/navigation";
import { mockCoupons } from "@/data/mockCouponData";
import { use } from "react";

export default function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const coupon = mockCoupons.find(c => c.id === id);

    const handleSubmit = (data: Omit<Coupon, "id" | "uses" | "status">) => {
        console.log("Updated promotion data:", data);
        // Todo: Implement API call to update promotion
        alert("Promotion updated successfully (mock)");
        router.push("/admin/promotions");
    };

    const handleCancel = () => {
        router.push("/admin/promotions");
    };

    if (!coupon) {
        return <div>Promotion not found</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Edit Promotion: ${coupon.code}`}
                description="Update promotional code settings."
                breadcrumbs={[
                    { label: "Promotions", href: "/admin/promotions" },
                    { label: coupon.code }
                ]}
                backHref="/admin/promotions"
            />

            <CouponForm
                initialData={coupon}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    );
}
