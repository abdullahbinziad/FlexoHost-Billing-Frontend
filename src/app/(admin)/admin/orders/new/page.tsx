"use client";

import { useState } from "react";
import {
    Search, Plus, CreditCard, User, Globe, Server,
    ShoppingCart, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BackButton } from "@/components/ui/back-button";
import { formatCurrency } from "@/utils/format";

// Mock Data
const MOCK_CLIENTS = [
    { id: "1", name: "Abdullah Bin Ziad", email: "abdullah@example.com" },
    { id: "2", name: "Moshiur Rahman", email: "moshiur@example.com" },
    { id: "3", name: "John Doe", email: "john@webhost.com" },
];

const PRODUCTS = [
    { id: "p1", name: "Starter Shared Hosting", price: 5.00 },
    { id: "p2", name: "Professional Shared Hosting", price: 15.00 },
    { id: "p3", name: "Business VPS Limited", price: 45.00 },
    { id: "p4", name: "Dedicated Server NVMe", price: 120.00 },
];

type ProductRow = {
    id: string;
    productId: string;
    domain: string;
    billingCycle: string;
    quantity: number;
    priceOverride: string;
};

type DomainRow = {
    id: string;
    type: "register" | "transfer";
    domain: string;
    period: string;
    dnsManagement: boolean;
    emailForwarding: boolean;
    idProtection: boolean;
    priceOverride: string;
};

export default function AddNewOrderPage() {
    // Global Settings
    const [clientSearch, setClientSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("sslcommerz");
    const [status, setStatus] = useState("pending");
    const [promoCode, setPromoCode] = useState("");

    // Checkboxes
    const [confOrder, setConfOrder] = useState(true);
    const [genInvoice, setGenInvoice] = useState(true);
    const [sendEmail, setSendEmail] = useState(true);

    // Dynamic Lists
    const [products, setProducts] = useState<ProductRow[]>([
        { id: "1", productId: "", domain: "", billingCycle: "monthly", quantity: 1, priceOverride: "" }
    ]);
    const [domains, setDomains] = useState<DomainRow[]>([]);

    // --- Actions ---

    const addProductRow = () => {
        setProducts([...products, {
            id: Math.random().toString(36).substr(2, 9),
            productId: "",
            domain: "",
            billingCycle: "monthly",
            quantity: 1,
            priceOverride: ""
        }]);
    };

    const removeProductRow = (id: string) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const updateProduct = (id: string, field: keyof ProductRow, value: any) => {
        setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const addDomainRow = () => {
        setDomains([...domains, {
            id: Math.random().toString(36).substr(2, 9),
            type: "register",
            domain: "",
            period: "1",
            dnsManagement: false,
            emailForwarding: false,
            idProtection: false,
            priceOverride: ""
        }]);
    };

    const removeDomainRow = (id: string) => {
        setDomains(domains.filter(d => d.id !== id));
    };

    const updateDomain = (id: string, field: keyof DomainRow, value: any) => {
        setDomains(domains.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    // --- Calculations ---
    const calculateTotal = () => {
        let total = 0;

        products.forEach(p => {
            const prod = PRODUCTS.find(x => x.id === p.productId);
            let price = prod ? prod.price : 0;
            if (p.priceOverride) price = parseFloat(p.priceOverride) || price;
            total += price * p.quantity;
        });

        domains.forEach(d => {
            let price = 12.00; // Base domain price
            if (d.priceOverride) price = parseFloat(d.priceOverride) || price;
            total += price * parseInt(d.period);
        });

        return total;
    };

    const totalAmount = calculateTotal();

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
            <div className="flex items-center gap-2 mb-2">
                <BackButton href="/admin/orders" label="Back to Orders" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Create New Order
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manually create a new order for a client.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN: FORM */}
                <div className="xl:col-span-8 space-y-8">

                    {/* 1. Client & Settings */}
                    <Card className="border-none shadow-md bg-white dark:bg-gray-900 overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg">Client & Order Settings</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {/* Client Search */}
                            <div className="space-y-2">
                                <Label>Client</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Start typing to search clients..."
                                        className="pl-9 h-11 bg-gray-50/50 dark:bg-gray-800/50"
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                    />
                                    {/* Mock Dropdown for demo if typing */}
                                    {clientSearch && !selectedClient && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg py-1">
                                            {MOCK_CLIENTS.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(client => (
                                                <div
                                                    key={client.id}
                                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                                    onClick={() => {
                                                        setSelectedClient(client.id);
                                                        setClientSearch(client.name);
                                                    }}
                                                >
                                                    <div className="font-medium">{client.name}</div>
                                                    <div className="text-xs text-muted-foreground">{client.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="my-2" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sslcommerz">SSLCommerz Online Gateway</SelectItem>
                                            <SelectItem value="bank">Bank Transfer</SelectItem>
                                            <SelectItem value="paypal">PayPal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Order Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="fraud">Fraud</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Promotion Code</Label>
                                <div className="flex gap-2">
                                    <Select value={promoCode} onValueChange={setPromoCode}>
                                        <SelectTrigger className="h-10 flex-1">
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="WELCOME20">WELCOME20 (20% Off)</SelectItem>
                                            <SelectItem value="BLACKFRIDAY">BLACKFRIDAY (50% Off)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" className="shrink-0 h-10 border-dashed">
                                        <Plus className="w-4 h-4 mr-2" /> Create Custom Promo
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="confOrder" checked={confOrder} onCheckedChange={(c) => setConfOrder(!!c)} />
                                    <Label htmlFor="confOrder" className="font-medium text-sm">Order Confirmation</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="genInvoice" checked={genInvoice} onCheckedChange={(c) => setGenInvoice(!!c)} />
                                    <Label htmlFor="genInvoice" className="font-medium text-sm">Generate Invoice</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="sendEmail" checked={sendEmail} onCheckedChange={(c) => setSendEmail(!!c)} />
                                    <Label htmlFor="sendEmail" className="font-medium text-sm">Send Email</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Products / Services */}
                    <Card className="border-none shadow-md bg-white dark:bg-gray-900 overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                                        <Server className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-lg">Products & Services</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {products.map((product, index) => (
                                <div key={product.id} className="relative rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 p-5 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm group">
                                    {/* Action Button: Remove */}
                                    {products.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeProductRow(product.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Product</Label>
                                            <Select
                                                value={product.productId}
                                                onValueChange={(val) => updateProduct(product.id, 'productId', val)}
                                            >
                                                <SelectTrigger className="bg-white dark:bg-gray-900 h-10">
                                                    <SelectValue placeholder="Select Product..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRODUCTS.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name} - ${p.price}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Domain</Label>
                                            <Input
                                                className="bg-white dark:bg-gray-900 h-10"
                                                placeholder="example.com"
                                                value={product.domain}
                                                onChange={(e) => updateProduct(product.id, 'domain', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Billing Cycle</Label>
                                            <Select
                                                value={product.billingCycle}
                                                onValueChange={(val) => updateProduct(product.id, 'billingCycle', val)}
                                            >
                                                <SelectTrigger className="bg-white dark:bg-gray-900 h-10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="annually">Annually</SelectItem>
                                                    <SelectItem value="triennially">Triennially</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Quantity</Label>
                                            <Input
                                                type="number"
                                                className="bg-white dark:bg-gray-900 h-10"
                                                min={1}
                                                value={product.quantity}
                                                onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Price Override</Label>
                                            <Input
                                                className="bg-white dark:bg-gray-900 h-10"
                                                placeholder="0.00"
                                                value={product.priceOverride}
                                                onChange={(e) => updateProduct(product.id, 'priceOverride', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Button
                                variant="outline"
                                className="w-full border-dashed py-6 text-muted-foreground hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                onClick={addProductRow}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Another Product
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 3. Domains */}
                    <Card className="border-none shadow-md bg-white dark:bg-gray-900 overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-orange-400 to-pink-500" />
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg">Domain Registration</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {domains.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <p>No domains added to this order.</p>
                                </div>
                            ) : (
                                domains.map((domain, index) => (
                                    <div key={domain.id} className="relative rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 p-5 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeDomainRow(domain.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>

                                        <div className="mb-4">
                                            <RadioGroup
                                                defaultValue="register"
                                                value={domain.type}
                                                onValueChange={(val: any) => updateDomain(domain.id, 'type', val)}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="register" id={`r-${domain.id}`} />
                                                    <Label htmlFor={`r-${domain.id}`}>Register</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="transfer" id={`t-${domain.id}`} />
                                                    <Label htmlFor={`t-${domain.id}`}>Transfer</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Domain</Label>
                                                <Input
                                                    className="bg-white dark:bg-gray-900 h-10"
                                                    placeholder="example.com"
                                                    value={domain.domain}
                                                    onChange={(e) => updateDomain(domain.id, 'domain', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Registration Period</Label>
                                                <Select
                                                    value={domain.period}
                                                    onValueChange={(val) => updateDomain(domain.id, 'period', val)}
                                                >
                                                    <SelectTrigger className="bg-white dark:bg-gray-900 h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">1 Year</SelectItem>
                                                        <SelectItem value="2">2 Years</SelectItem>
                                                        <SelectItem value="3">3 Years</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-6 mb-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`dns-${domain.id}`}
                                                    checked={domain.dnsManagement}
                                                    onCheckedChange={(c) => updateDomain(domain.id, 'dnsManagement', !!c)}
                                                />
                                                <Label htmlFor={`dns-${domain.id}`} className="text-sm">DNS Management</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`email-${domain.id}`}
                                                    checked={domain.emailForwarding}
                                                    onCheckedChange={(c) => updateDomain(domain.id, 'emailForwarding', !!c)}
                                                />
                                                <Label htmlFor={`email-${domain.id}`} className="text-sm">Email Forwarding</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`id-${domain.id}`}
                                                    checked={domain.idProtection}
                                                    onCheckedChange={(c) => updateDomain(domain.id, 'idProtection', !!c)}
                                                />
                                                <Label htmlFor={`id-${domain.id}`} className="text-sm">ID Protection</Label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Price Override</Label>
                                            <Input
                                                className="bg-white dark:bg-gray-900 max-w-xs h-10"
                                                placeholder="0.00"
                                                value={domain.priceOverride}
                                                onChange={(e) => updateDomain(domain.id, 'priceOverride', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}

                            <Button
                                variant="outline"
                                className="w-full border-dashed py-6 text-muted-foreground hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                                onClick={addDomainRow}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Another Domain
                            </Button>
                        </CardContent>
                    </Card>

                </div>

                {/* RIGHT COLUMN: SUMMARY */}
                <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-6">
                    <Card className="border-none shadow-xl bg-white dark:bg-gray-900 overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
                        <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" /> Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {(products.length === 0 && domains.length === 0) ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No items selected
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {products.map(p => {
                                        const prod = PRODUCTS.find(x => x.id === p.productId);
                                        return (
                                            <div key={p.id} className="flex justify-between items-start text-sm">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {prod ? prod.name : "Select Product"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {p.domain} {p.domain && '•'} {p.billingCycle}
                                                    </p>
                                                </div>
                                                <span className="font-medium">
                                                    {p.priceOverride ? formatCurrency(parseFloat(p.priceOverride), 'BDT') :
                                                        (prod ? formatCurrency(prod.price * p.quantity, 'BDT') : formatCurrency(0, 'BDT'))}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {domains.map(d => (
                                        <div key={d.id} className="flex justify-between items-start text-sm">
                                            <div className="space-y-1">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Domain {d.type === 'register' ? 'Registration' : 'Transfer'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {d.domain || '(No domain)'} • {d.period} Year(s)
                                                </p>
                                            </div>
                                            <span className="font-medium">
                                                {d.priceOverride ? formatCurrency(parseFloat(d.priceOverride), 'BDT') : formatCurrency(12.00 * parseInt(d.period), 'BDT')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Sub Total</span>
                                    <span>{formatCurrency(totalAmount, 'BDT')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Tax (0%)</span>
                                    <span>{formatCurrency(0, 'BDT')}</span>
                                </div>
                            </div>
                        </CardContent>

                        <div className="bg-green-50 dark:bg-green-900/20 p-6 border-t border-green-100 dark:border-green-900/50">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-2xl font-bold text-green-700 dark:text-green-400">Total</span>
                                <span className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(totalAmount, 'BDT')}</span>
                            </div>
                            <Button className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white">
                                Submit Order
                            </Button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
