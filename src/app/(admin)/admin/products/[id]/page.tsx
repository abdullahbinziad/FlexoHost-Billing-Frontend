"use client";

import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { PageHeader } from "@/components/ui/page-header";
import type { Product } from "@/types/admin";
import { useGetProductQuery, useUpdateProductMutation } from "@/store/api/productApi";
import { devLog } from "@/lib/devLog";
import { toast } from "sonner";

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const { data: product, isLoading, error } = useGetProductQuery(productId);
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    const handleUpdateProduct = async (updatedData: Omit<Product, "id" | "createdAt" | "isHidden">) => {
        try {
            await updateProduct({
                id: productId,
                data: updatedData
            }).unwrap();

            toast.success("Product updated successfully!");
            router.push("/admin/products");
        } catch (error: any) {
            devLog("Failed to update product:", error);
            const errorMessage = error?.data?.message || error?.message || "Failed to update product. Please try again.";
            toast.error(errorMessage);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Edit Product"
                    description="Loading product details..."
                    breadcrumbs={[
                        { label: "Products", href: "/admin/products" },
                        { label: "Edit" }
                    ]}
                    backHref="/admin/products"
                />
                <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Edit Product"
                    description="Product not found"
                    breadcrumbs={[
                        { label: "Products", href: "/admin/products" },
                        { label: "Edit" }
                    ]}
                    backHref="/admin/products"
                />
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <p className="text-destructive mb-4">Failed to load product. Product may not exist.</p>
                        <button
                            onClick={() => router.push("/admin/products")}
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
                title="Edit Product"
                description={`Update details for ${product.name}`}
                breadcrumbs={[
                    { label: "Products", href: "/admin/products" },
                    { label: "Edit" }
                ]}
                backHref="/admin/products"
            />

            <ProductForm
                variant="page"
                onSubmit={handleUpdateProduct}
                initialData={product}
            />
        </div>
    );
}
