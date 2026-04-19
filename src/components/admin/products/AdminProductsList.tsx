"use client";

import { useState } from "react";
import { devLog } from "@/lib/devLog";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Filter, Copy, CopyPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import type { Product, ProductType } from "@/types/admin";
import { SERVER_GROUP_OPTIONS } from "@/types/admin";

/** Product type filter options for admin products list */
const PRODUCT_TYPE_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: "all", label: "All Types" },
    { value: "hosting", label: "Hosting" },
    { value: "vps", label: "VPS" },
    { value: "dedicated", label: "Dedicated Server" },
    { value: "ssl", label: "SSL" },
    { value: "mail", label: "Business Mail" },
];
import Link from "next/link";
import { toast } from "sonner";
import {
    useGetProductsQuery,
    useDeleteProductMutation,
    useToggleProductVisibilityMutation,
    useDuplicateProductMutation,
} from "@/store/api/productApi";
import { DataTablePagination } from "@/components/shared/DataTablePagination";


interface AdminProductsListProps {
    category?: ProductType;
    addProductLabel?: string;
    addProductHref?: string;
    editProductHref?: string; // Pattern like "/admin/products/{id}"
}

export function AdminProductsList({
    category,
    addProductLabel = "Add Product",
    addProductHref,
    editProductHref,
}: AdminProductsListProps) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedGroup, setSelectedGroup] = useState<string>("all");
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    // API supports: hosting, vps, domain, ssl. For "all", "dedicated", "mail" fetch all (no type) and filter client-side.
    const supportedTypes = ["hosting", "vps", "domain", "ssl"];
    const apiTypeParam = supportedTypes.includes(selectedType) ? selectedType : category;

    // Fetch products from API
    const { data: productsData, isLoading, error } = useGetProductsQuery({
        type: apiTypeParam,
        page: 1,
        limit: 500,
    });

    // Mutations for delete and toggle visibility
    const [deleteProduct] = useDeleteProductMutation();
    const [toggleVisibility] = useToggleProductVisibilityMutation();
    const [duplicateProduct] = useDuplicateProductMutation();

    // Extract products from API response
    const products = productsData?.products || [];

    // Filter products based on search query, selected type, and selected group
    const filteredProducts = products.filter(
        (product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.type.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = selectedType === "all" || product.type === selectedType;
            const matchesGroup = selectedGroup === "all" || product.group === selectedGroup;

            return matchesSearch && matchesType && matchesGroup;
        }
    );
    const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;

    /**
     * Handle product visibility toggle
     */
    const handleToggleVisibility = async (id: string, currentHiddenState: boolean) => {
        try {
            await toggleVisibility({ id, isHidden: !currentHiddenState }).unwrap();
            toast.success(currentHiddenState ? "Product is now visible" : "Product is now hidden");
        } catch (error: any) {
            devLog("Failed to toggle visibility:", error);
            toast.error(error?.data?.message || "Failed to update product visibility");
        }
    };

    /**
     * Handle product deletion confirmation
     */
    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            await deleteProduct(productToDelete).unwrap();
            toast.success("Product deleted successfully!");
            setProductToDelete(null);
        } catch (error: any) {
            devLog("Failed to delete product:", error);
            toast.error(error?.data?.message || "Failed to delete product");
        }
    };

    /**
     * Prompt for deletion
     */
    const handleDeleteClick = (id: string) => {
        setProductToDelete(id);
    };

    /**
     * Copy checkout link for product to clipboard.
     * Uses pid (from data collection) - checkout page accepts pid param.
     */
    const handleCopyCheckoutLink = async (product: Product) => {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const productId = product.pid ?? product.id;
        const checkoutUrl = `${baseUrl}/checkout?pid=${productId}`;
        try {
            await navigator.clipboard.writeText(checkoutUrl);
            toast.success("Checkout link copied to clipboard");
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const handleDuplicateProduct = async (product: Product) => {
        try {
            const cloned = await duplicateProduct(product.id).unwrap();
            toast.success("Product duplicated. Opening copy in editor…");
            if (editProductHref) {
                const href = editProductHref.replace("{id}", (cloned as any).id ?? (cloned as any)._id);
                if (typeof window !== "undefined") {
                    window.location.href = href;
                }
            }
        } catch (error: any) {
            devLog("Failed to duplicate product:", error);
            toast.error(error?.data?.message || "Failed to duplicate product");
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">Loading products...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-destructive">Failed to load products. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Products & Services</h2>
                {addProductHref && (
                    <Link href={addProductHref}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {addProductLabel}
                        </Button>
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="pl-8"
                    />
                </div>

                {/* Product Type Filter */}
                <Select value={selectedType} onValueChange={(value) => {
                    setSelectedType(value);
                    setPage(1);
                }}>
                    <SelectTrigger className="w-[200px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        {PRODUCT_TYPE_FILTER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={selectedGroup} onValueChange={(value) => {
                    setSelectedGroup(value);
                    setPage(1);
                }}>
                    <SelectTrigger className="w-[200px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {SERVER_GROUP_OPTIONS.map((group) => (
                            <SelectItem key={group} value={group}>
                                {group}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredProducts.length} of {products.length} products
                    {selectedType !== "all" && ` · ${PRODUCT_TYPE_FILTER_OPTIONS.find((o) => o.value === selectedType)?.label ?? selectedType}`}
                    {selectedGroup !== "all" && ` · ${selectedGroup}`}
                </p>
            </div>

            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right min-w-[320px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div>{product.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {product.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {product.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {product.group}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant={product.isHidden ? "secondary" : "default"}>
                                            {product.isHidden ? "Hidden" : "Active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 flex-wrap">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCopyCheckoutLink(product)}
                                                title="Copy checkout link"
                                                className="gap-1.5 shrink-0"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copy link
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDuplicateProduct(product)}
                                                title="Duplicate product"
                                                className="gap-1.5 shrink-0"
                                            >
                                                <CopyPlus className="w-4 h-4" />
                                                Duplicate
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleToggleVisibility(product.id, product.isHidden)}>
                                                {product.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                            {editProductHref ? (
                                                <Link href={editProductHref.replace("{id}", product.id)}>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button variant="ghost" size="icon" disabled>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(product.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination
                page={page}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                pageSize={pageSize}
                currentCount={paginatedProducts.length}
                itemLabel="products"
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(1);
                }}
            />


            {/* Delete Confirmation Dialog */}
            <ConfirmActionDialog
                open={!!productToDelete}
                onOpenChange={(open) => !open && setProductToDelete(null)}
                title="Delete product?"
                description="This action cannot be undone. The product will be permanently removed."
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </div>
    );
}
