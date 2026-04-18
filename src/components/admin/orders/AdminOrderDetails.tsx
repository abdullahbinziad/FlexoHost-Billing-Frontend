"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetOrderByIdQuery, useRunModuleCreateMutation, useUpdateOrderStatusMutation } from "@/store/api/orderApi";
import { OrderHeader } from "./details/OrderHeader";
import { OrderItemsCard } from "./details/OrderItemsCard";
import { OrderSidebar } from "./details/OrderSidebar";
import { toast } from "sonner";
import { useGetServersQuery } from "@/store/api/serverApi";
import { getEligibleServersForHostingOrderItem } from "@/utils/hostingOrderServerFilter";
import { ORDER_PAYMENT_STATUS, ORDER_STATUS } from "@/constants/status";

interface AdminOrderDetailsProps {
    orderId: string;
}

function generateSuggestedUsernameFromDomain(domain: string): string {
    const base = (domain || "")
        .replace(/^www\./i, "")
        .split("/")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 10) || "user";
    return `${base}${Math.floor(100 + Math.random() * 900)}`.slice(0, 16);
}

function generateStrongPassword(length = 16): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let out = "";
    for (let i = 0; i < length; i++) {
        out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
}

export function AdminOrderDetails({ orderId }: AdminOrderDetailsProps) {
    const { data: servers = [] } = useGetServersQuery();
    const { data: response, isLoading, refetch } = useGetOrderByIdQuery(orderId);
    const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
    const [runModuleCreate, { isLoading: isRunningModule }] = useRunModuleCreateMutation();
    const orderData = response?.data;
    const [manualConfigByItemId, setManualConfigByItemId] = useState<Record<string, {
        username?: string;
        password?: string;
        serverId?: string;
        registrar?: string;
        runModuleCreate?: boolean;
        sendWelcomeEmail?: boolean;
    }>>({});

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
            status: ([ORDER_STATUS.PENDING, ORDER_STATUS.ACTIVE, ORDER_STATUS.CANCELLED, ORDER_STATUS.FRAUD, ORDER_STATUS.PROCESSING, "on hold", ORDER_STATUS.DRAFT].includes(mappedStatus) ? mappedStatus.replace(" ", "_") : ORDER_STATUS.PENDING) as string,
            paymentStatus: ([ORDER_PAYMENT_STATUS.PAID, ORDER_PAYMENT_STATUS.UNPAID, ORDER_PAYMENT_STATUS.REFUNDED, ORDER_PAYMENT_STATUS.INCOMPLETE].includes(mappedPaymentStatus)
                ? mappedPaymentStatus
                : ORDER_PAYMENT_STATUS.UNPAID) as "paid" | "unpaid" | "refunded" | "incomplete",
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
                    provisioningStatus: item.provisioningStatus ?? "",
                    provisioningError: item.provisioningError ?? "",
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

    /** Stable fingerprint so RTK Query’s `servers` array reference does not retrigger the effect every render. */
    const serversSignature = useMemo(
        () => (servers ?? []).map((s) => `${s.id}:${s.accountCount ?? ""}:${s.maxAccounts ?? ""}:${s.location ?? ""}`).join("|"),
        [servers]
    );

    useEffect(() => {
        if (!order?.items?.length) return;
        setManualConfigByItemId((prev) => {
            let changed = false;
            const next = { ...prev };
            for (const item of order.items) {
                const itemId = item._raw?._id ? String(item._raw._id) : "";
                if (!itemId) continue;
                const domain = String(item.domain || item._raw?.configSnapshot?.primaryDomain || "");
                const eligible =
                    item.type === "HOSTING"
                        ? getEligibleServersForHostingOrderItem(servers, item._raw)
                        : [];
                const suggestedServerId = eligible[0]?.id || "";
                const existing = next[itemId];
                const fromMeta = String(item.server || "").trim();

                if (!existing) {
                    const pick =
                        item.type === "HOSTING"
                            ? suggestedServerId || fromMeta
                            : fromMeta;
                    next[itemId] = {
                        username: item.username || generateSuggestedUsernameFromDomain(domain),
                        password: generateStrongPassword(),
                        serverId: pick,
                        registrar: (item._raw?.configSnapshot?.registrar as string) || "dynadot",
                        runModuleCreate: true,
                        sendWelcomeEmail: true,
                    };
                    changed = true;
                    continue;
                }

                if (item.type === "HOSTING" && eligible.length > 0) {
                    const cur = String(existing.serverId || "").trim();
                    const valid = eligible.some((s) => s.id === cur);
                    if (!cur || !valid) {
                        const newId = suggestedServerId;
                        if (existing.serverId !== newId) {
                            next[itemId] = { ...existing, serverId: newId };
                            changed = true;
                        }
                    }
                }
            }
            return changed ? next : prev;
        });
        // serversSignature avoids infinite loops from unstable RTK `servers` array identity; omit `servers` from deps.
    }, [order, serversSignature]);

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

    const handleManualConfigChange = (itemId: string, updates: Partial<{
        username?: string;
        password?: string;
        serverId?: string;
        registrar?: string;
        runModuleCreate?: boolean;
        sendWelcomeEmail?: boolean;
    }>) => {
        setManualConfigByItemId((prev) => ({
            ...prev,
            [itemId]: { ...prev[itemId], ...updates },
        }));
    };

    const handleAcceptOrder = async () => {
        try {
            const manualCandidates = (order.items || []).filter((item: any) => {
                const status = String(item.provisioningStatus || "").toUpperCase();
                const isProvisioned = item.type === "HOSTING"
                    ? Boolean(item.username)
                    : status === "ACTIVE";
                const isFailed = Boolean(item.provisioningError) || status === "FAILED";
                return order.paymentStatus === "paid" && !isProvisioned && isFailed && (item.type === "HOSTING" || item.type === "DOMAIN");
            });

            if (manualCandidates.length > 0) {
                const moduleItems = manualCandidates.map((item: any) => {
                    const itemId = String(item._raw?._id || "");
                    const cfg = manualConfigByItemId[itemId] || {};
                    return {
                        itemIndex: (order.items || []).findIndex((it: any) => String(it._raw?._id || "") === itemId),
                        orderItemId: itemId,
                        username: cfg.username || undefined,
                        password: cfg.password || undefined,
                        serverId: cfg.serverId || undefined,
                        registrar: cfg.registrar || undefined,
                        runModuleCreate: cfg.runModuleCreate !== false,
                        sendWelcomeEmail: cfg.sendWelcomeEmail !== false,
                    };
                });

                const result = await runModuleCreate({ orderId: order.id, items: moduleItems }).unwrap();
                const failed = (result?.results || []).filter((r: any) => !r.success);
                if (failed.length > 0) {
                    toast.error(failed[0]?.error || "Some module actions failed. Please review item errors.");
                    return;
                }
                await refetch();
            }

            await updateOrderStatus({ orderId: order.id, status: "ACTIVE" }).unwrap();
            await refetch();
            toast.success("Order accepted successfully");
        } catch (e: any) {
            toast.error(e?.data?.message || e?.message || "Failed to accept order");
        }
    };

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
            {/* Header */}
            <OrderHeader order={order} onStatusChange={handleStatusChange} disabled={isUpdatingStatus} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left */}
                <div className="xl:col-span-2 space-y-6">
                    <OrderItemsCard
                        order={order}
                        manualConfigByItemId={manualConfigByItemId}
                        onManualConfigChange={handleManualConfigChange}
                    />
                </div>

                {/* Right */}
                <div className="xl:col-span-1">
                    <OrderSidebar
                        order={order}
                        onStatusChange={handleStatusChange}
                        onAcceptOrder={handleAcceptOrder}
                        isUpdatingStatus={isUpdatingStatus || isRunningModule}
                    />
                </div>
            </div>
        </div>
    );
}