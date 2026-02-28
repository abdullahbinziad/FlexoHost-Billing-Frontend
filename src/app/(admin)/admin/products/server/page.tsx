import { AdminProductsList } from "@/components/admin/products/AdminProductsList";

export default function AdminServerPage() {
    return (
        <AdminProductsList
            category="vps"
            addProductLabel="Add VPS/Dedicated Server"
            addProductHref="/admin/products/server/new"
            editProductHref="/admin/products/server/{id}"
        />
    );
}
