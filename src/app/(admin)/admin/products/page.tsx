import { AdminProductsList } from "@/components/admin/products/AdminProductsList";

export default function AdminProductsPage() {
    return (
        <AdminProductsList
            addProductLabel="Add Product"
            addProductHref="/admin/products/add"
            editProductHref="/admin/products/{id}"
        />
    );
}
