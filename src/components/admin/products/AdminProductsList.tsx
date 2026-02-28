"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Filter } from "lucide-react";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Product, ProductType } from "@/types/admin";
import Link from "next/link";
import { toast } from "sonner";
import {
    useGetProductsQuery,
    useDeleteProductMutation,
    useToggleProductVisibilityMutation,
} from "@/store/api/productApi";

/**
 * Hardcoded hosting type groups for filtering
 */
const HOSTING_GROUPS = [
    "Web Hosting",
    "BDIX Hosting",
    "Turbo Hosting",
    "Ecommerce Hosting",
    "VPS",
    "BDIX Vps",
] as const;

interface AdminProductsListProps {
    category?: ProductType;
    addProductLabel?: string;
    addProductHref?: string;
    editProductHref?: string; // Pattern like "/admin/products/hosting/{id}"
}

export function AdminProductsList({
    category,
    addProductLabel = "Add Product",
    addProductHref,
    editProductHref,
}: AdminProductsListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<string>("all");
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    // Fetch products from API
    const { data: productsData, isLoading, error } = useGetProductsQuery({
        type: category,
        page: 1,
        limit: 100,
    });

    // Mutations for delete and toggle visibility
    const [deleteProduct] = useDeleteProductMutation();
    const [toggleVisibility] = useToggleProductVisibilityMutation();

    // Extract products from API response
    const products = productsData?.products || [];

    // Filter products based on search query and selected group
    const filteredProducts = products.filter(
        (product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.type.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesGroup = selectedGroup === "all" || product.group === selectedGroup;

            return matchesSearch && matchesGroup;
        }
    );

    /**
     * Handle product visibility toggle
     */
    const handleToggleVisibility = async (id: string, currentHiddenState: boolean) => {
        try {
            await toggleVisibility({ id, isHidden: !currentHiddenState }).unwrap();
            toast.success(currentHiddenState ? "Product is now visible" : "Product is now hidden");
        } catch (error: any) {
            console.error("Failed to toggle visibility:", error);
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
            console.error("Failed to delete product:", error);
            toast.error(error?.data?.message || "Failed to delete product");
        }
    };

    /**
     * Prompt for deletion
     */
    const handleDeleteClick = (id: string) => {
        setProductToDelete(id);
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

            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>

                {/* Group Filter */}
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="w-[200px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {HOSTING_GROUPS.map((group) => (
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
                    {selectedGroup !== "all" && ` in ${selectedGroup}`}
                </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                            filteredProducts.map((product) => (
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
                                        <div className="flex justify-end gap-2">
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


            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
