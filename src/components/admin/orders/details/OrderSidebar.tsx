"use client";

import Link from "next/link";
import { Check, X, ShieldAlert, Trash2, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderSidebarProps {
    order: any;
    onStatusChange?: (status: string) => void;
    isUpdatingStatus?: boolean;
}

export function OrderSidebar({ order, onStatusChange, isUpdatingStatus }: OrderSidebarProps) {
    const rawStatus = order.rawStatus || order.status || "PENDING_PAYMENT";
    const invoiceId = order.invoice?._id ?? order.invoiceId;

    const handleStatus = (status: string) => {
        if (!onStatusChange) return;
        onStatusChange(status);
    };

    const handleAccept = () => handleStatus("ACTIVE");
    const handleCancel = () => {
        if (!confirm("Set this order to Cancelled? The client will see the order as cancelled.")) return;
        handleStatus("CANCELLED");
    };
    const handleSetFraud = () => {
        if (!confirm("Mark this order as Fraud? This status is used for suspicious or fraudulent orders.")) return;
        handleStatus("FRAUD");
    };
    const handleDelete = () => {
        if (!confirm("Cancel and close this order? This will set status to Cancelled.")) return;
        handleStatus("CANCELLED");
    };

    const isPending = rawStatus === "PENDING_PAYMENT" || rawStatus === "DRAFT" || rawStatus === "PROCESSING";
    const isActive = rawStatus === "ACTIVE";
    const isCancelled = rawStatus === "CANCELLED";
    const isFraud = rawStatus === "FRAUD";

    return (
        <div className="space-y-6">
            {/* Actions Card */}
            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Order Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all hover:shadow-md"
                            onClick={handleAccept}
                            disabled={isUpdatingStatus || isActive}
                        >
                            <Check className="w-4 h-4 mr-2" /> Accept Order
                        </Button>
                        <Button
                            variant="outline"
                            className="border-gray-200 hover:bg-gray-50 text-gray-700"
                            onClick={handleCancel}
                            disabled={isUpdatingStatus || isCancelled}
                        >
                            <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button
                            variant="outline"
                            className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                            onClick={handleSetFraud}
                            disabled={isUpdatingStatus || isFraud}
                        >
                            <ShieldAlert className="w-4 h-4 mr-2" /> Set as Fraud
                        </Button>
                        <div className="ml-auto">
                            <Button
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleDelete}
                                disabled={isUpdatingStatus || isCancelled}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Cancel Order
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Client Details */}
            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-4">
                    <CardTitle className="text-base font-semibold">Client Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-lg shrink-0">
                            {(order.clientDetails?.name || order.userName)?.charAt(0) || "?"}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {order.clientDetails?.name || order.userName || "—"}
                            </h3>
                            {order.clientDetails?.companyName && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{order.clientDetails.companyName}</p>
                            )}
                            <div className="flex gap-2 pt-2 flex-wrap">
                                <Badge variant="outline" className="text-[10px] font-normal text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                                    Client
                                </Badge>
                                {order.userId && (
                                    <Badge variant="outline" className="text-[10px] font-normal text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                                        User ID: {String(order.userId).slice(-8)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                        <div className="flex flex-col space-y-0.5">
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</span>
                            <a
                                href={order.clientDetails?.email || order.userEmail ? `mailto:${order.clientDetails?.email || order.userEmail}` : undefined}
                                className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                            >
                                {order.clientDetails?.email || order.userEmail || "—"}
                            </a>
                        </div>
                        <div className="flex flex-col space-y-0.5">
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone</span>
                            <span className="text-gray-700 dark:text-gray-300">
                                {order.clientDetails?.phoneNumber || "—"}
                            </span>
                        </div>
                        {order.clientDetails && (order.clientDetails.address || order.clientDetails.city || order.clientDetails.country) && (
                            <div className="flex flex-col space-y-0.5">
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Address</span>
                                <span className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {[
                                        order.clientDetails.address,
                                        [order.clientDetails.city, order.clientDetails.state, order.clientDetails.postcode].filter(Boolean).join(", "),
                                        order.clientDetails.country,
                                    ].filter(Boolean).join("\n") || "—"}
                                </span>
                            </div>
                        )}
                    </div>

                    {order.clientId ? (
                        <Button variant="outline" className="w-full text-xs h-8" asChild>
                            <Link href={`/admin/clients/${order.clientId}`}>
                                View Client Profile <ExternalLink className="w-3 h-3 ml-1 inline" />
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full text-xs h-8" disabled>
                            View Client Profile
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-4">
                    <CardTitle className="text-base font-semibold">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Payment</span>
                        <Badge
                            variant={order.paymentStatus === "paid" ? "default" : "secondary"}
                            className={order.paymentStatus === "paid" ? "bg-green-600" : ""}
                        >
                            {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "unpaid" ? "Unpaid" : String(order.paymentStatus)}
                        </Badge>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> Invoice
                        </span>
                        {invoiceId ? (
                            <Link
                                href={`/admin/billing/invoices/${String(invoiceId)}`}
                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                {order.invoice?.invoiceNumber ?? "View invoice"}
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        ) : (
                            <span className="text-gray-500 italic">No invoice</span>
                        )}
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">IP Address</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{order.ipAddress || "—"}</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Promotion</span>
                        <span className="text-gray-700 dark:text-gray-300 italic">{order.promotionCode || "None"}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Affiliate</span>
                        <span className="text-gray-700 dark:text-gray-300 italic">{order.affiliate || "None"}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
