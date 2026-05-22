"use client";

import { ProductForm } from "@/components/admin/products/ProductForm";
import { PageHeader } from "@/components/ui/page-header";
import type { Product } from "@/types/admin";
import { useRouter } from "next/navigation";
import { useCreateProductMutation } from "@/store/api/productApi";
import { devLog } from "@/lib/devLog";
import { toast } from "sonner";

export default function AddProductPage() {
    const router = useRouter();
    const [createProduct, { isLoading }] = useCreateProductMutation();

    const handleCreateProduct = async (newProductData: Omit<Product, "id" | "createdAt" | "isHidden">) => {
        try {
            await createProduct(newProductData).unwrap();
            toast.success("Product created successfully!");
            router.push("/admin/products");
        } catch (error: any) {
            devLog("Failed to create product:", error);
            const errorMessage = error?.data?.message || error?.message || "Failed to create product. Please try again.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New Product"
                description="Create a new product for your store."
                breadcrumbs={[
                    { label: "Products", href: "/admin/products" },
                    { label: "Add Product" }
                ]}
                backHref="/admin/products"
            />

            <ProductForm
                variant="page"
                onSubmit={handleCreateProduct}
            />
        </div>
    );
}
