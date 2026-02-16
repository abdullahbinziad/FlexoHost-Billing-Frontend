"use client";

import { useState } from "react";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { PageHeader } from "@/components/ui/page-header";
import type { Product } from "@/types/admin";
import { useRouter } from "next/navigation";
import { mockAdminProducts } from "@/data/mockAdminData"; // For now update local mock state/log it

export default function AddHostingPage() {
    const router = useRouter();

    const handleCreateProduct = (newProductData: Omit<Product, "id" | "createdAt" | "isHidden">) => {
        // In a real app, this would call an API
        console.log("Creating new hosting product:", newProductData);
        alert("Product created successfully! (Mock)");
        router.push("/admin/products/hosting");
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New Hosting Package"
                description="Create a new web hosting plan for your customers."
                breadcrumbs={[
                    { label: "Products", href: "/admin/products" },
                    { label: "Hosting", href: "/admin/products/hosting" },
                    { label: "Add New" }
                ]}
                backHref="/admin/products/hosting"
            />

            <ProductForm
                variant="page"
                onSubmit={handleCreateProduct}
                initialData={{
                    id: "",
                    createdAt: "",
                    isHidden: false,
                    name: "",
                    type: "hosting",
                    group: "", // Will force user to select
                    description: "",
                    price: 0,
                    currency: "BDT",
                    billingCycle: "annually",
                    features: [],
                    stock: undefined
                }}
            />
        </div>
    );
}
