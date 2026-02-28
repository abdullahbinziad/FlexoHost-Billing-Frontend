"use client";

import { ProductForm } from "@/components/admin/products/ProductForm";
import { PageHeader } from "@/components/ui/page-header";
import type { Product } from "@/types/admin";
import { useRouter } from "next/navigation";
import { useCreateProductMutation } from "@/store/api/productApi";
import { toast } from "sonner";

/**
 * Add New VPS/Server Package Page
 * 
 * Allows admin users to create new VPS/Server packages with full configuration
 * including pricing, features, module settings, and free domain options.
 */
export default function AddServerPage() {
    const router = useRouter();
    const [createProduct, { isLoading }] = useCreateProductMutation();

    /**
     * Handle product creation
     * Submits the form data to the API and handles success/error states
     */
    const handleCreateProduct = async (newProductData: Omit<Product, "id" | "createdAt" | "isHidden">) => {
        try {
            // Call the API to create the product
            const result = await createProduct(newProductData).unwrap();

            // Show success notification
            toast.success("VPS/Server package created successfully!");

            // Redirect to the server products list
            router.push("/admin/products/server");
        } catch (error: any) {
            // Handle API errors
            console.error("Failed to create product:", error);

            const errorMessage = error?.data?.message || error?.message || "Failed to create VPS/Server package. Please try again.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New VPS/Dedicated Server"
                description="Create a new VPS or dedicated server product for your customers."
                breadcrumbs={[
                    { label: "Products", href: "/admin/products" },
                    { label: "VPS/Dedicated", href: "/admin/products/server" },
                    { label: "Add New" }
                ]}
                backHref="/admin/products/server"
            />

            <ProductForm
                variant="page"
                onSubmit={handleCreateProduct}
            />
        </div>
    );
}
