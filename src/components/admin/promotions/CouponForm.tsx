"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coupon } from "@/types/admin";
import { Tag, Percent, Calendar, Settings } from "lucide-react";

interface CouponFormProps {
    initialData?: Coupon;
    onSubmit: (data: Omit<Coupon, "id" | "uses" | "status">) => void;
    onCancel?: () => void;
}

export function CouponForm({ initialData, onSubmit, onCancel }: CouponFormProps) {
    const [formData, setFormData] = useState<Omit<Coupon, "id" | "uses" | "status">>({
        code: initialData?.code || "",
        type: initialData?.type || "percentage",
        value: initialData?.value || 0,
        recurring: initialData?.recurring || false,
        recurringTimes: initialData?.recurringTimes || 0,
        maxUses: initialData?.maxUses || 0,
        startDate: initialData?.startDate || "",
        expiryDate: initialData?.expiryDate || "",
        billingCycles: initialData?.billingCycles || [],
        domainPeriods: initialData?.domainPeriods || [],
        appliesToProducts: initialData?.appliesToProducts || [],
        requiresProducts: initialData?.requiresProducts || [],
        allowExistingProducts: initialData?.allowExistingProducts || false,
        applyOnce: initialData?.applyOnce || false,
        newSignupsOnly: initialData?.newSignupsOnly || false,
        applyOncePerClient: initialData?.applyOncePerClient || false,
        existingClientOnly: initialData?.existingClientOnly || false,
        upgradesDowngrades: initialData?.upgradesDowngrades || false,
        lifetimePromotion: initialData?.lifetimePromotion || false,
        adminNotes: initialData?.adminNotes || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value
        }));
    };

    const handleCheckboxChange = (name: keyof typeof formData, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleBillingCycleChange = (cycle: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            billingCycles: checked
                ? [...prev.billingCycles, cycle]
                : prev.billingCycles.filter(c => c !== cycle)
        }));
    };

    const handleDomainPeriodChange = (period: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            domainPeriods: checked
                ? [...prev.domainPeriods, period]
                : prev.domainPeriods.filter(p => p !== period)
        }));
    };

    const generateCode = () => {
        const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        setFormData(prev => ({ ...prev, code: randomCode }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="space-y-8">

                {/* Basic Information */}
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Tag className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Promotion Details</CardTitle>
                                <CardDescription>Configure the basic promotion code and discount</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-sm font-medium">Promotion Code *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="code"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g., SUMMER2024"
                                        required
                                        className="h-11"
                                    />
                                    <Button type="button" variant="outline" onClick={generateCode} className="h-11">
                                        Auto Generate Code
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-sm font-medium">Type *</Label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange as unknown as React.ChangeEventHandler<HTMLSelectElement>}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="value" className="text-sm font-medium">
                                    Value * {formData.type === "percentage" ? "(%)" : "(BDT)"}
                                </Label>
                                <Input
                                    id="value"
                                    name="value"
                                    type="number"
                                    step="0.01"
                                    value={formData.value}
                                    onChange={handleChange}
                                    placeholder={formData.type === "percentage" ? "30.00" : "1699.00"}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Recurring</Label>
                                <div className="flex items-center gap-4 h-11">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="recurring"
                                            checked={formData.recurring}
                                            onCheckedChange={(checked) => handleCheckboxChange("recurring", !!checked)}
                                        />
                                        <Label htmlFor="recurring" className="font-normal cursor-pointer">
                                            Enable - Recur For
                                        </Label>
                                    </div>
                                    <Input
                                        type="number"
                                        name="recurringTimes"
                                        value={formData.recurringTimes}
                                        onChange={handleChange}
                                        disabled={!formData.recurring}
                                        placeholder="0"
                                        className="w-24 h-9"
                                    />
                                    <span className="text-sm text-muted-foreground">Times (0 = unlimited)</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Date & Usage Limits */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Date & Usage Limits</CardTitle>
                                <CardDescription>Set validity period and usage restrictions</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-sm font-medium">
                                    Start Date
                                    <span className="text-xs text-muted-foreground ml-2">(Leave blank for none)</span>
                                </Label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiryDate" className="text-sm font-medium">
                                    Expiry Date
                                    <span className="text-xs text-muted-foreground ml-2">(Leave blank for none)</span>
                                </Label>
                                <Input
                                    id="expiryDate"
                                    name="expiryDate"
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="maxUses" className="text-sm font-medium">
                                    Maximum Uses
                                    <span className="text-xs text-muted-foreground ml-2">(Enter 0 to allow unlimited uses)</span>
                                </Label>
                                <Input
                                    id="maxUses"
                                    name="maxUses"
                                    type="number"
                                    value={formData.maxUses}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="h-11"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Cycles & Domain Periods */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Percent className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Billing Cycles & Domain Periods</CardTitle>
                                <CardDescription>Select applicable billing cycles and domain registration periods</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Billing Cycles (No selection = any)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
                                {["One Time", "Monthly", "Quarterly", "Semi-Annually", "Annually", "Biennially", "Triennially"].map((cycle) => (
                                    <label key={cycle} className="flex items-center space-x-2 cursor-pointer">
                                        <Checkbox
                                            checked={formData.billingCycles.includes(cycle.toLowerCase())}
                                            onCheckedChange={(checked) => handleBillingCycleChange(cycle.toLowerCase(), !!checked)}
                                        />
                                        <span className="text-sm">{cycle}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Domains</Label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-muted/30 rounded-lg">
                                {["1 Year", "2 Years", "3 Years", "4 Years", "5 Years", "6 Years", "7 Years", "8 Years", "9 Years", "10 Years"].map((period, index) => (
                                    <label key={period} className="flex items-center space-x-2 cursor-pointer">
                                        <Checkbox
                                            checked={formData.domainPeriods.includes(String(index + 1))}
                                            onCheckedChange={(checked) => handleDomainPeriodChange(String(index + 1), !!checked)}
                                        />
                                        <span className="text-sm">{period}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Advanced Options */}
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Settings className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Advanced Options</CardTitle>
                                <CardDescription>Configure additional promotion restrictions and behaviors</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                    id="allowExistingProducts"
                                    checked={formData.allowExistingProducts}
                                    onCheckedChange={(checked) => handleCheckboxChange("allowExistingProducts", !!checked)}
                                />
                                <span className="text-sm">Also allow existing products in account to qualify for promotion</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                    id="lifetimePromotion"
                                    checked={formData.lifetimePromotion}
                                    onCheckedChange={(checked) => handleCheckboxChange("lifetimePromotion", !!checked)}
                                />
                                <span className="text-sm">Discounted pricing is applied even on upgrade and downgrade orders in the future regardless of settings like max uses, expiry, etc.</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                    id="applyOnce"
                                    checked={formData.applyOnce}
                                    onCheckedChange={(checked) => handleCheckboxChange("applyOnce", !!checked)}
                                />
                                <span className="text-sm">Apply only once per order (even if multiple items qualify)</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                    id="newSignupsOnly"
                                    checked={formData.newSignupsOnly}
                                    onCheckedChange={(checked) => handleCheckboxChange("newSignupsOnly", !!checked)}
                                />
                                <span className="text-sm">Apply to new signups only (must have no previous active orders)</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                    id="applyOncePerClient"
                                    checked={formData.applyOncePerClient}
                                    onCheckedChange={(checked) => handleCheckboxChange("applyOncePerClient", !!checked)}
                                />
                                <span className="text-sm">Apply only once per client globally (ie. only one order allowed per promo)</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                    id="existingClientOnly"
                                    checked={formData.existingClientOnly}
                                    onCheckedChange={(checked) => handleCheckboxChange("existingClientOnly", !!checked)}
                                />
                                <span className="text-sm">Apply to existing clients only (must have an active order to qualify)</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                    id="upgradesDowngrades"
                                    checked={formData.upgradesDowngrades}
                                    onCheckedChange={(checked) => handleCheckboxChange("upgradesDowngrades", !!checked)}
                                />
                                <span className="text-sm">Enable for product upgrades</span>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminNotes" className="text-sm font-medium">Admin Notes</Label>
                            <Textarea
                                id="adminNotes"
                                name="adminNotes"
                                value={formData.adminNotes}
                                onChange={handleChange}
                                className="min-h-[80px] resize-none"
                                placeholder="Internal notes about this promotion..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4 pb-8">
                    <Button type="button" variant="outline" onClick={onCancel} size="lg" className="min-w-32">
                        Cancel Changes
                    </Button>
                    <Button type="submit" size="lg" className="min-w-32">
                        Save Changes
                    </Button>
                </div>
            </div>
        </form>
    );
}
