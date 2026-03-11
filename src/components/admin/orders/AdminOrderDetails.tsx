"use client";

import { useMemo } from "react";
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from "@/store/api/orderApi";
import { OrderHeader } from "./details/OrderHeader";
import { OrderItemsCard } from "./details/OrderItemsCard";
import { OrderSidebar } from "./details/OrderSidebar";
import { toast } from "sonner";

interface AdminOrderDetailsProps {
    orderId: string;
}

export function AdminOrderDetails({ orderId }: AdminOrderDetailsProps) {
    const { data: response, isLoading } = useGetOrderByIdQuery(orderId);
    const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
    const orderData = response?.data;

    // Map to UI model (memoized so rerenders are stable)
    const order = useMemo(() => {
        if (!orderData) return null;

        const rawStatus = orderData.status || "PENDING_PAYMENT";
        const mappedStatus = rawStatus.toLowerCase().replace("_", " ");
        const mappedPaymentStatus = orderData.invoice?.status?.toLowerCase() || "unpaid";

        return {
            id: orderData._id,
            customOrderId: orderData.orderId || `ORD-${orderData._id?.slice(-6) || ""}`,
            orderNumber: orderData.orderNumber,
            rawStatus,
            status: (["pending", "active", "cancelled", "fraud", "processing", "on hold", "draft"].includes(mappedStatus) ? mappedStatus.replace(" ", "_") : "pending") as string,
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
            clientId: orderData.client?._id ?? orderData.clientId ?? undefined,
            invoice: orderData.invoice,
            ipAddress: orderData.meta?.ipAddress || "N/A",
            promotionCode: orderData.meta?.promotionCode || undefined,
            affiliate: orderData.meta?.affiliate || undefined,
            clientDetails: orderData.client
                ? {
                    firstName: orderData.client.firstName ?? "",
                    lastName: orderData.client.lastName ?? "",
                    name: orderData.client.name ?? ([orderData.client.firstName, orderData.client.lastName].filter(Boolean).join(" ") || "—"),
                    email: orderData.client.email ?? orderData.client.contactEmail ?? "",
                    companyName: orderData.client.companyName ?? "",
                    phoneNumber: orderData.client.phoneNumber ?? "",
                    address: orderData.client.address?.street ?? "",
                    city: orderData.client.address?.city ?? "",
                    state: orderData.client.address?.state ?? "",
                    postcode: orderData.client.address?.postCode ?? "",
                    country: orderData.client.address?.country ?? "",
                }
                : undefined,
            // Hosting first, then Domain, then other types
            items: (orderData.items || [])
                .map((item: any) => ({
                    productId: item.productId,
                    type: item.type,
                    productName: item.nameSnapshot || (item.type === "DOMAIN" ? "Domain Registration" : "Service"),
                    domain: item.configSnapshot?.primaryDomain ?? item.configSnapshot?.domain ?? item.configSnapshot?.domainName ?? "",
                    billingCycle: item.billingCycle || "One Time",
                    price: item.pricingSnapshot?.total ?? item.total ?? 0,
                    status: "Pending",
                    username: item.meta?.accountUsername ?? item.meta?.username ?? "",
                    password: item.meta?.password ?? "",
                    server: item.meta?.serverId ?? item.meta?.server ?? "",
                    _raw: item,
                }))
                .sort((a: any, b: any) => {
                    const order = { HOSTING: 0, DOMAIN: 1 };
                    const ai = order[a.type as keyof typeof order] ?? 2;
                    const bi = order[b.type as keyof typeof order] ?? 2;
                    return ai - bi;
                }),
        };
    }, [orderData]);

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500 mt-10">Loading order details...</div>;
    }

    if (!order) {
        return <div className="p-6 text-center text-gray-500 mt-10">Order not found</div>;
    }

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateOrderStatus({ orderId: order.id, status: newStatus }).unwrap();
            toast.success("Order status updated");
        } catch (e: any) {
            toast.error(e?.data?.message || e?.message || "Failed to update status");
        }
    };

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
            {/* Header */}
            <OrderHeader order={order} onStatusChange={handleStatusChange} disabled={isUpdatingStatus} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left */}
                <div className="xl:col-span-2 space-y-6">
                    <OrderItemsCard order={order} />
                </div>

                {/* Right */}
                <div className="xl:col-span-1">
                    <OrderSidebar order={order} onStatusChange={handleStatusChange} isUpdatingStatus={isUpdatingStatus} />
                </div>
            </div>
        </div>
    );
}