/**
 * Shared rules for admin order details: when provisioning succeeded vs failed,
 * and when to show the manual module runner.
 */

export interface OrderItemProvisionInput {
    type?: string;
    username?: string | null;
    provisioningStatus?: string | null;
    provisioningError?: string | null;
}

export function getOrderItemProvisionUiState(item: OrderItemProvisionInput, paymentStatus: string) {
    const isPaid = paymentStatus === "paid";
    const statusUp = String(item.provisioningStatus || "").toUpperCase();

    const isHostingProvisioned =
        item.type === "HOSTING" && (Boolean(item.username) || statusUp === "ACTIVE");
    const isDomainProvisioned = item.type === "DOMAIN" && statusUp === "ACTIVE";
    const isProvisioned =
        item.type === "HOSTING"
            ? isHostingProvisioned
            : item.type === "DOMAIN"
                ? isDomainProvisioned
                : statusUp === "ACTIVE";

    const isFailed =
        statusUp === "FAILED" ||
        (Boolean(item.provisioningError) && !isProvisioned);

    const isProvisionableType = item.type === "HOSTING" || item.type === "DOMAIN";
    const showManualFallback =
        isProvisionableType &&
        !isProvisioned &&
        (isFailed || (item.type === "HOSTING" && !isPaid));

    return {
        statusUp,
        isPaid,
        isProvisioned,
        isFailed,
        showManualFallback,
    };
}
