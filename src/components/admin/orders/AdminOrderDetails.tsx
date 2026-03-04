"use client";

import { useMemo } from "react";
import { useGetOrderByIdQuery } from "@/store/api/orderApi";
import { OrderHeader } from "./details/OrderHeader";
import { OrderItemsCard } from "./details/OrderItemsCard";
import { OrderSidebar } from "./details/OrderSidebar";

interface AdminOrderDetailsProps {
    orderId: string;
}

export function AdminOrderDetails({ orderId }: AdminOrderDetailsProps) {
    const { data: response, isLoading } = useGetOrderByIdQuery(orderId);
    const orderData = response?.data;

    // Map to UI model (memoized so rerenders are stable)
    const order = useMemo(() => {
        if (!orderData) return null;

        const mappedStatus = orderData.status?.toLowerCase().replace("_", " ") || "pending";
        const mappedPaymentStatus = orderData.invoice?.status?.toLowerCase() || "unpaid";

        return {
            id: orderData._id,
            customOrderId: orderData.orderId || `ORD-${orderData._id?.slice(-6) || ""}`,
            orderNumber: orderData.orderNumber,
            status: (["pending", "active", "cancelled", "fraud"].includes(mappedStatus) ? mappedStatus : "pending") as
                | "pending"
                | "active"
                | "cancelled"
                | "fraud",
            paymentStatus: (["paid", "unpaid", "refunded", "incomplete"].includes(mappedPaymentStatus)
                ? mappedPaymentStatus
                : "unpaid") as "paid" | "unpaid" | "refunded" | "incomplete",
            paymentMethod: orderData.invoice?.paymentMethod || "N/A",
            createdAt: orderData.date,
            totalAmount: orderData.invoice?.total || orderData.total || 0,
            currency: orderData.currency || "BDT",
            userName: orderData.client?.name || "Unknown",
            userEmail: orderData.client?.email || "",
            userId: orderData.userId || "N/A",
            invoice: orderData.invoice,
            ipAddress: orderData.meta?.ipAddress || "N/A",
            promotionCode: orderData.meta?.promotionCode || undefined,
            affiliate: orderData.meta?.affiliate || undefined,
            clientDetails: orderData.client
                ? {
                    address: orderData.client.address?.street || "N/A",
                    city: orderData.client.address?.city || "N/A",
                    state: orderData.client.address?.state || "N/A",
                    postcode: orderData.client.address?.postCode || "N/A",
                    country: orderData.client.address?.country || "N/A",
                }
                : undefined,
            items: (orderData.items || []).map((item: any) => ({
                productId: item.productId,
                type: item.type,
                productName: item.nameSnapshot || (item.type === "DOMAIN" ? "Domain Registration" : "Service"),
                domain: item.configSnapshot?.domainName || item.configSnapshot?.primaryDomain || "",
                billingCycle: item.billingCycle || "One Time",
                price: item.pricingSnapshot?.total || item.total || 0,
                status: "Pending",
                username: item.meta?.username || "",
                password: item.meta?.password || "",
                server: item.meta?.server || "",
                _raw: item,
            })),
        };
    }, [orderData]);

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500 mt-10">Loading order details...</div>;
    }

    if (!order) {
        return <div className="p-6 text-center text-gray-500 mt-10">Order not found</div>;
    }

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
            {/* Header */}
            <OrderHeader order={order} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left */}
                <div className="xl:col-span-2 space-y-6">
                    <OrderItemsCard order={order} />
                </div>

                {/* Right */}
                <div className="xl:col-span-1">
                    <OrderSidebar order={order} />
                </div>
            </div>
        </div>
    );
}