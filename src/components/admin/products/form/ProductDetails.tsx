/**
 * ProductDetails Component
 * 
 * Handles the basic product information including name, category, description, and features.
 * This is the first tab in the product creation/editing form.
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "lucide-react";
import type { ProductType } from "@/types/admin";

interface ProductDetailsProps {
    formData: {
        name: string;
        type: ProductType;
        group: string;
        description: string;
        featuresText: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setFormData: (updater: (prev: any) => any) => void;
}

export function ProductDetails({ formData, handleChange, setFormData }: ProductDetailsProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Product Details</CardTitle>
                        <CardDescription>Basic information about the product</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Product Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Business Plan"
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Category / Group *</Label>
                        {formData.type === "hosting" ? (
                            <Select
                                value={formData.group}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, group: value }))}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select a Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Web Hosting">Web Hosting</SelectItem>
                                    <SelectItem value="Turbo Hosting">Turbo Hosting</SelectItem>
                                    <SelectItem value="BDIX Hosting">BDIX Hosting</SelectItem>
                                    <SelectItem value="Ecommerce Hosting">Ecommerce Hosting</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : formData.type === "vps" ? (
                            <Select
                                value={formData.group}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, group: value }))}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select a Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VPS">VPS</SelectItem>
                                    <SelectItem value="Dedicated">Dedicated</SelectItem>
                                    <SelectItem value="BDIX VPS">BDIX VPS</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                id="group"
                                name="group"
                                value={formData.group}
                                onChange={handleChange}
                                placeholder="e.g. Shared Hosting, Premium VPS"
                                className="h-10"
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Brief description of the package"
                        className="h-10"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="featuresText" className="text-sm font-medium">
                        Features List
                        <span className="text-xs text-muted-foreground ml-2">(One feature per line)</span>
                    </Label>
                    <Textarea
                        id="featuresText"
                        name="featuresText"
                        value={formData.featuresText}
                        onChange={handleChange}
                        className="min-h-[150px] resize-none"
                        placeholder={"SSD Separated\nUnlimited Bandwidth\nFree SSL"}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
