import { BackButton } from "@/components/ui/back-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/utils/format";

const ORDER_STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: "DRAFT", label: "Draft" },
    { value: "PENDING_PAYMENT", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "FRAUD", label: "Fraud" },
];

function statusBadgeClass(rawStatus: string): string {
    switch (rawStatus) {
        case "PENDING_PAYMENT":
        case "DRAFT":
            return "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
        case "ACTIVE":
        case "PROCESSING":
            return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
        case "CANCELLED":
            return "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
        case "FRAUD":
            return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
        case "ON_HOLD":
            return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
        default:
            return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
}

interface OrderHeaderProps {
    order: any;
    onStatusChange?: (status: string) => void;
    disabled?: boolean;
}

export function OrderHeader({ order, onStatusChange, disabled }: OrderHeaderProps) {
    const rawStatus = order.rawStatus || order.status || "PENDING_PAYMENT";
    const displayLabel = ORDER_STATUS_OPTIONS.find((o) => o.value === rawStatus)?.label ?? rawStatus.replace(/_/g, " ");

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <BackButton href="/admin/orders" label="Back to Orders" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        {order.customOrderId}{" "}
                        <span className="text-xl font-mono text-gray-400">({order.orderNumber})</span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Created on {formatDate(order.createdAt)} • {order.paymentMethod}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-[180px]">
                        <Select
                            value={rawStatus}
                            onValueChange={onStatusChange}
                            disabled={disabled}
                        >
                            <SelectTrigger
                                className={`h-10 border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 ${statusBadgeClass(rawStatus)}`}
                            >
                                <SelectValue>{displayLabel}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {ORDER_STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
