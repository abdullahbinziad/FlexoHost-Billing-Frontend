import { useState } from "react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DOMAIN_REGISTRARS = ["Dynadot", "Namely", "ConnectReseller"] as const;

interface OrderItemsCardProps {
    order: any;
}

export function OrderItemsCard({ order }: OrderItemsCardProps) {
    const formatCurrency = useFormatCurrency();
    const [selectedRegistrarByItem, setSelectedRegistrarByItem] = useState<Record<number, string>>({});

    return (
        <Card className="shadow-sm border-gray-200 dark:border-gray-800 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
                    Order Items
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {order.items.map((item: any, index: number) => (
                        <div
                            key={index}
                            className={`p-6 transition-colors hover:bg-gray-50/30 dark:hover:bg-gray-800/30 border-l-4 ${
                                item.type === "HOSTING"
                                    ? "border-l-blue-500"
                                    : item.type === "DOMAIN"
                                        ? "border-l-emerald-500"
                                        : "border-l-gray-300 dark:border-l-gray-600"
                            }`}
                        >
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1 space-y-3 w-full">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                                    {item.productName}
                                                </h4>
                                                {item.type === "HOSTING" ? (
                                                    <span className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:text-blue-200 ring-1 ring-inset ring-blue-700/20">
                                                        Hosting
                                                    </span>
                                                ) : item.type === "DOMAIN" ? (
                                                    <span className="inline-flex items-center rounded-md bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200 ring-1 ring-inset ring-emerald-700/20">
                                                        Domain
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {item.type || "Product"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                            {formatCurrency(item.price, order.currency)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-4">
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg space-y-1">
                                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                                Billing Cycle
                                            </span>
                                            <div className="font-medium text-gray-900 dark:text-gray-200">
                                                {item.billingCycle || "One Time"}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg space-y-1">
                                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                                Status
                                            </span>
                                            <div className="font-medium text-gray-900 dark:text-gray-200">
                                                {item.status || "Pending"}
                                            </div>
                                        </div>

                                        {item.type !== "DOMAIN" && (
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg space-y-1">
                                                <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                                    Domain
                                                </span>
                                                <div className="font-medium text-gray-900 dark:text-gray-200 flex items-center justify-between gap-2">
                                                    <span className="min-w-0 truncate">{item.domain || "—"}</span>
                                                    {item.domain && (
                                                        <div className="flex shrink-0 gap-2 text-[10px] uppercase font-bold text-gray-400">
                                                            <a href="#" className="hover:text-blue-600 transition-colors">www</a>
                                                            <a href="#" className="hover:text-blue-600 transition-colors">whois</a>
                                                            <a href="#" className="hover:text-blue-600 transition-colors">dns</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* HOSTING: read-only provisioning status (cPanel is created automatically when invoice is paid) */}
                                    {item.type === "HOSTING" && (
                                        <div className="bg-blue-600/5 rounded-lg border border-blue-600/10 p-4 mt-4">
                                            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                                                <div>
                                                    <span className="text-gray-500 uppercase tracking-wider">Primary domain</span>
                                                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 break-all">
                                                        {item.domain ?? item._raw?.configSnapshot?.primaryDomain ?? "—"}
                                                    </span>
                                                </div>
                                                <div>
                                                    {item.username ? (
                                                        <span className="text-green-600 dark:text-green-400 font-medium">Provisioned • Account: {item.username}</span>
                                                    ) : item.provisioningError ? (
                                                        <span className="text-red-600 dark:text-red-400 font-medium" title={item.provisioningError}>
                                                            Provisioning failed: {item.provisioningError}
                                                        </span>
                                                    ) : order.paymentStatus === "paid" ? (
                                                        <span className="text-amber-600 dark:text-amber-400">Provisioning in progress…</span>
                                                    ) : (
                                                        <span className="text-gray-500">Auto-provisioned when invoice is paid</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* DOMAIN Config */}
                                    {item.type === "DOMAIN" && (
                                        <div className="bg-orange-600/5 rounded-lg border border-orange-600/10 p-4 mt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-gray-500">Domain Provider</label>
                                                    <Select
                                                        value={selectedRegistrarByItem[index] || DOMAIN_REGISTRARS[0]?.toLowerCase() || ""}
                                                        onValueChange={(v) =>
                                                            setSelectedRegistrarByItem((prev) => ({ ...prev, [index]: v }))
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 bg-white">
                                                            <SelectValue placeholder="Select Provider" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {DOMAIN_REGISTRARS.map((r) => (
                                                                <SelectItem key={r} value={r.toLowerCase()}>
                                                                    {r}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-6 mt-4 pt-3 border-t border-orange-600/10">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`send-register-${index}`}
                                                        defaultChecked
                                                        className="data-[state=checked]:bg-orange-600 border-orange-600/30"
                                                    />
                                                    <label
                                                        htmlFor={`send-register-${index}`}
                                                        className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Send to Register
                                                    </label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`send-domain-email-${index}`}
                                                        defaultChecked
                                                        className="data-[state=checked]:bg-orange-600 border-orange-600/30"
                                                    />
                                                    <label
                                                        htmlFor={`send-domain-email-${index}`}
                                                        className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Send Welcome Email
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Total Amount Due</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(order.totalAmount ?? order.total ?? 0, order.currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
