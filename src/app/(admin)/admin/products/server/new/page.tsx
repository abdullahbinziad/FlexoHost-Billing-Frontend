"use client";

import { useState } from "react";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { PageHeader } from "@/components/ui/page-header";
import type { Product } from "@/types/admin";
import { useRouter } from "next/navigation";

export default function AddServerPage() {
    const router = useRouter();

    const handleCreateProduct = (newProductData: Omit<Product, "id" | "createdAt" | "isHidden">) => {
        // In a real app, this would call an API
        console.log("Creating new VPS/Dedicated server:", newProductData);
        alert("Server product created successfully! (Mock)");
        router.push("/admin/products/server");
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New VPS/Dedicated Server"
                description="Create a new VPS or dedicated server product for your customers."
                breadcrumbs={[
                    { label: "Services", href: "/admin/products" },
                    { label: "VPS/Dedicated", href: "/admin/products/server" },
                    { label: "Add New" }
                ]}
                backHref="/admin/products/server"
            />

            <ProductForm
                variant="page"
                onSubmit={handleCreateProduct}
                initialData={{
                    id: "",
                    createdAt: "",
                    isHidden: false,
                    name: "",
                    type: "vps",
                    group: "", // Will force user to select
                    description: "",
                    price: 0,
                    currency: "BDT",
                    billingCycle: "monthly",
                    features: [],
                    stock: undefined
                }}
            />
        </div>
    );
}
