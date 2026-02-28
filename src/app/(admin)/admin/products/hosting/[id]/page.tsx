"use client";

import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { PageHeader } from "@/components/ui/page-header";
import type { Product } from "@/types/admin";
import { useGetProductQuery, useUpdateProductMutation } from "@/store/api/productApi";
import { toast } from "sonner";

/**
 * Edit Hosting Package Page
 * 
 * Allows admin users to edit existing hosting packages.
 * Reuses the ProductForm component with initialData populated from the API.
 */
export default function EditHostingPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    // Fetch the product data
    const { data: product, isLoading, error } = useGetProductQuery(productId);

    // Update mutation
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    /**
     * Handle product update
     * Submits the updated form data to the API
     */
    const handleUpdateProduct = async (updatedData: Omit<Product, "id" | "createdAt" | "isHidden">) => {
        try {
            // Call the API to update the product
            await updateProduct({
                id: productId,
                data: updatedData
            }).unwrap();

            // Show success notification
            toast.success("Hosting package updated successfully!");

            // Redirect to the hosting products list
            router.push("/admin/products/hosting");
        } catch (error: any) {
            // Handle API errors
            console.error("Failed to update product:", error);

            const errorMessage = error?.data?.message || error?.message || "Failed to update hosting package. Please try again.";
            toast.error(errorMessage);
        }
    };

    // Show loading state while fetching product
    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Edit Hosting Package"
                    description="Loading product details..."
                    breadcrumbs={[
                        { label: "Products", href: "/admin/products" },
                        { label: "Hosting", href: "/admin/products/hosting" },
                        { label: "Edit" }
                    ]}
                    backHref="/admin/products/hosting"
                />
                <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">Loading product...</p>
                </div>
            </div>
        );
    }

    // Show error state if product not found or error occurred
    if (error || !product) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Edit Hosting Package"
                    description="Product not found"
                    breadcrumbs={[
                        { label: "Products", href: "/admin/products" },
                        { label: "Hosting", href: "/admin/products/hosting" },
                        { label: "Edit" }
                    ]}
                    backHref="/admin/products/hosting"
                />
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <p className="text-destructive mb-4">Failed to load product. Product may not exist.</p>
                        <button
                            onClick={() => router.push("/admin/products/hosting")}
                            className="text-primary hover:underline"
                        >
                            Return to Products List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Hosting Package"
                description={`Update details for ${product.name}`}
                breadcrumbs={[
                    { label: "Products", href: "/admin/products" },
                    { label: "Hosting", href: "/admin/products/hosting" },
                    { label: "Edit" }
                ]}
                backHref="/admin/products/hosting"
            />

            <ProductForm
                variant="page"
                onSubmit={handleUpdateProduct}
                initialData={product}
            />
        </div>
    );
}
