"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockAdminProducts } from "@/data/mockAdminData";
import { ProductForm } from "./ProductForm";
import type { Product, ProductType } from "@/types/admin";
import { formatCurrency } from "@/utils/format";

import Link from "next/link"; // Ensure Link is imported

interface AdminProductsListProps {
    category?: ProductType;
    addProductLabel?: string;
    addProductHref?: string;
}

export function AdminProductsList({
    category,
    addProductLabel = "Add Product",
    addProductHref,
}: AdminProductsListProps) {
    const [products, setProducts] = useState<Product[]>(mockAdminProducts);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredProducts = products.filter(
        (product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.type.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = category ? product.type === category : true;

            return matchesSearch && matchesCategory;
        }
    );

    const handleAddProduct = (newProductData: Omit<Product, "id" | "createdAt" | "isHidden">) => {
        const newProduct: Product = {
            ...newProductData,
            group: newProductData.group || "",
            id: `p${Date.now()}`,
            createdAt: new Date().toISOString(),
            isHidden: false,
        };
        setProducts([...products, newProduct]);
    };

    const toggleVisibility = (id: string) => {
        setProducts(products.map(p =>
            p.id === id ? { ...p, isHidden: !p.isHidden } : p
        ));
    };

    const deleteProduct = (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Products & Services</h2>
                {addProductHref ? (
                    <Link href={addProductHref}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {addProductLabel}
                        </Button>
                    </Link>
                ) : (
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {addProductLabel}
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
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
                                        {product.paymentType === "free" ? (
                                            <span>Free</span>
                                        ) : (
                                            (() => {
                                                const pricing = product.pricing?.[0];
                                                if (!pricing) return <span>-</span>;
                                                // Display monthly price if enabled, otherwise find first enabled
                                                const displayDetails = pricing.monthly?.enable
                                                    ? { price: pricing.monthly.price, label: "mo" }
                                                    : pricing.annually?.enable
                                                        ? { price: pricing.annually.price, label: "yr" }
                                                        : { price: 0, label: "" };

                                                return (
                                                    <>
                                                        {formatCurrency(displayDetails.price, pricing.currency)}
                                                        {displayDetails.label && (
                                                            <span className="text-xs text-muted-foreground ml-1">
                                                                /{displayDetails.label}
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            })()
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {product.stock !== undefined ? product.stock : "Unlimited"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.isHidden ? "secondary" : "default"}>
                                            {product.isHidden ? "Hidden" : "Active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => toggleVisibility(product.id)}>
                                                {product.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteProduct(product.id)}>
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

            <ProductForm
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSubmit={handleAddProduct}
            />
        </div>
    );
}
