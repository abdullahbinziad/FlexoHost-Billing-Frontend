import { AdminProductsList } from "@/components/admin/products/AdminProductsList";

export default function AdminHostingPage() {
    return (
        <AdminProductsList
            category="hosting"
            addProductLabel="Add Hosting Package"
            addProductHref="/admin/products/hosting/new"
        />
    );
}
