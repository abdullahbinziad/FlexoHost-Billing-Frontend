"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockCoupons } from "@/data/mockCouponData";
import { Coupon } from "@/types/admin";
import { Plus, Copy, Pencil, Trash2 } from "lucide-react";

export default function PromotionsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
    const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

    const filteredCoupons = coupons.filter(coupon => {
        if (filter === "all") return true;
        return coupon.status === filter;
    });

    const handleDuplicate = (couponId: string) => {
        const coupon = coupons.find(c => c.id === couponId);
        if (coupon) {
            const newCoupon = {
                ...coupon,
                id: `${coupon.id}-copy-${Date.now()}`,
                code: `${coupon.code}_COPY`,
                uses: 0
            };
            setCoupons(prev => [...prev, newCoupon]);
            alert("Coupon duplicated successfully!");
        }
    };

    const handleExpireNow = (couponId: string) => {
        setCoupons(prev => prev.map(c =>
            c.id === couponId ? { ...c, status: "expired" as const } : c
        ));
        alert("Coupon expired!");
    };

    const handleDelete = (couponId: string) => {
        if (confirm("Are you sure you want to delete this coupon?")) {
            setCoupons(prev => prev.filter(c => c.id !== couponId));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Promotions/Coupons</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {filteredCoupons.length} Records Found, Page 1 of 1
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === "active" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("active")}
                    >
                        Active Promotions
                    </Button>
                    <Button
                        variant={filter === "expired" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("expired")}
                    >
                        Expired Promotions
                    </Button>
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                    >
                        All Promotions
                    </Button>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <Link href="/admin/promotions/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Promotion
                    </Button>
                </Link>
                <div className="text-sm text-muted-foreground">
                    Jump to Page: <input type="number" defaultValue={1} className="w-16 px-2 py-1 border rounded ml-2" />
                    <Button size="sm" variant="outline" className="ml-2">Go</Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                                <TableHead className="text-primary-foreground">Promotion Code</TableHead>
                                <TableHead className="text-primary-foreground">Type</TableHead>
                                <TableHead className="text-primary-foreground">Value</TableHead>
                                <TableHead className="text-primary-foreground">Recurring</TableHead>
                                <TableHead className="text-primary-foreground">Uses</TableHead>
                                <TableHead className="text-primary-foreground">Start Date</TableHead>
                                <TableHead className="text-primary-foreground">Expiry Date</TableHead>
                                <TableHead className="text-primary-foreground w-[200px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCoupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-medium">{coupon.code}</TableCell>
                                    <TableCell className="capitalize">{coupon.type}</TableCell>
                                    <TableCell>
                                        {coupon.type === "percentage" ? `${coupon.value}%` : `৳${coupon.value.toFixed(2)}`}
                                    </TableCell>
                                    <TableCell>
                                        {coupon.recurring ? (
                                            <Badge variant="default" className="bg-green-500">
                                                ✓
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {coupon.uses}/{coupon.maxUses === 0 ? "∞" : coupon.maxUses}
                                    </TableCell>
                                    <TableCell>{coupon.startDate || "-"}</TableCell>
                                    <TableCell>{coupon.expiryDate || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                title="Duplicate"
                                                onClick={() => handleDuplicate(coupon.id)}
                                            >
                                                <Copy className="w-4 h-4 text-green-600" />
                                            </Button>
                                            <Link href={`/admin/promotions/${coupon.id}`}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-600" />
                                                </Button>
                                            </Link>
                                            {coupon.status === "active" && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-xs"
                                                    onClick={() => handleExpireNow(coupon.id)}
                                                >
                                                    Expire Now
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                title="Delete"
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
