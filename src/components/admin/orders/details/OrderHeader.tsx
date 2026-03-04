import { BackButton } from "@/components/ui/back-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/utils/format";

interface OrderHeaderProps {
    order: any;
    onStatusChange?: (status: string) => void;
}

export function OrderHeader({ order, onStatusChange }: OrderHeaderProps) {
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
                            value={(order.status || "Pending").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
                            onValueChange={onStatusChange}
                        >
                            <SelectTrigger
                                className={`h-10 border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 ${order.status === "pending"
                                        ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                                        : order.status === "active"
                                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                            : "bg-gray-50 text-gray-700"
                                    }`}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                <SelectItem value="Fraud">Fraud</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
