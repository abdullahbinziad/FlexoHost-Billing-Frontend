import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGetServersQuery } from "@/store/api/serverApi";
import { getEligibleServersForHostingOrderItem } from "@/utils/hostingOrderServerFilter";
import { getOrderItemProvisionUiState } from "@/utils/orderItemProvisionUi";

const DOMAIN_REGISTRARS = ["Dynadot", "Namely", "ConnectReseller"] as const;

interface OrderItemsCardProps {
    order: any;
    manualConfigByItemId?: Record<string, {
        username?: string;
        password?: string;
        serverId?: string;
        registrar?: string;
        runModuleCreate?: boolean;
        sendWelcomeEmail?: boolean;
    }>;
    onManualConfigChange?: (itemId: string, updates: Partial<{
        username?: string;
        password?: string;
        serverId?: string;
        registrar?: string;
        runModuleCreate?: boolean;
        sendWelcomeEmail?: boolean;
    }>) => void;
}

export function OrderItemsCard({ order, manualConfigByItemId = {}, onManualConfigChange }: OrderItemsCardProps) {
    const formatCurrency = useFormatCurrency();
    const { data: servers = [] } = useGetServersQuery();

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
                        (() => {
                            const itemId = String(item._raw?._id || "");
                            const manualConfig = manualConfigByItemId[itemId] || {};
                            const eligibleHostingServers =
                                item.type === "HOSTING"
                                    ? getEligibleServersForHostingOrderItem(servers, item._raw)
                                    : [];
                            const {
                                isPaid,
                                isProvisioned,
                                isFailed,
                                showManualFallback,
                            } = getOrderItemProvisionUiState(
                                {
                                    type: item.type,
                                    username: item.username,
                                    provisioningStatus: item.provisioningStatus,
                                    provisioningError: item.provisioningError,
                                },
                                order.paymentStatus
                            );

                            return (
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
                                                    {isProvisioned ? (
                                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                                            Account Created Successfully - {item.domain ?? item._raw?.configSnapshot?.primaryDomain ?? "—"}
                                                        </span>
                                                    ) : isFailed ? (
                                                        <span className="text-red-600 dark:text-red-400 font-medium" title={item.provisioningError}>
                                                            Provisioning failed: {item.provisioningError}
                                                        </span>
                                                    ) : isPaid ? (
                                                        <span className="text-amber-600 dark:text-amber-400">Provisioning in progress…</span>
                                                    ) : (
                                                        <span className="text-gray-500">Auto-provisioned when invoice is paid</span>
                                                    )}
                                                </div>
                                            </div>
                                            {showManualFallback && (
                                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <Input
                                                        placeholder="cPanel username (optional; auto from domain if empty)"
                                                        value={manualConfig.username || ""}
                                                        onChange={(e) => onManualConfigChange?.(itemId, { username: e.target.value })}
                                                    />
                                                    <Input
                                                        placeholder="Password (optional; auto-generated if empty)"
                                                        type="text"
                                                        value={manualConfig.password || ""}
                                                        onChange={(e) => onManualConfigChange?.(itemId, { password: e.target.value })}
                                                    />
                                                    <div className="space-y-1">
                                                        <Select
                                                            value={manualConfig.serverId || ""}
                                                            onValueChange={(value) => onManualConfigChange?.(itemId, { serverId: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select server" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {eligibleHostingServers.map((server) => (
                                                                    <SelectItem key={server.id} value={server.id}>
                                                                        {server.name || server.hostname || server.id}
                                                                        {typeof server.accountCount === "number" && typeof server.maxAccounts === "number"
                                                                            ? ` (${server.accountCount}/${server.maxAccounts})`
                                                                            : ""}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Only servers matching this order&apos;s location (
                                                            {String(item._raw?.configSnapshot?.serverLocation || "—")}), product server group, and free
                                                            capacity.
                                                        </p>
                                                        {eligibleHostingServers.length === 0 ? (
                                                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                                                No eligible cPanel server found. Check Server Config (groups, location, WHM sync) or
                                                                capacity.
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex items-center space-x-2 md:col-span-3">
                                                        <Checkbox
                                                            id={`run-module-${itemId}`}
                                                            checked={manualConfig.runModuleCreate !== false}
                                                            onCheckedChange={(checked) => onManualConfigChange?.(itemId, { runModuleCreate: checked === true })}
                                                        />
                                                        <label htmlFor={`run-module-${itemId}`} className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            Run Module Create
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* DOMAIN Config */}
                                    {item.type === "DOMAIN" && (
                                        <div className="bg-orange-600/5 rounded-lg border border-orange-600/10 p-4 mt-4">
                                            <div className="text-sm">
                                                {isProvisioned ? (
                                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                                        Domain {String(item._raw?.actionType || "").toUpperCase() === "TRANSFER" ? "Transfer" : "Registration"} Completed - {item.domain || item._raw?.configSnapshot?.domainName || "—"}
                                                    </span>
                                                ) : isFailed ? (
                                                    <span className="text-red-600 dark:text-red-400 font-medium" title={item.provisioningError}>
                                                        Provisioning failed: {item.provisioningError}
                                                    </span>
                                                ) : isPaid ? (
                                                    <span className="text-amber-600 dark:text-amber-400">Provisioning in progress…</span>
                                                ) : (
                                                    <span className="text-gray-500">Auto-processed when invoice is paid</span>
                                                )}
                                            </div>

                                            {showManualFallback && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-gray-500">Domain Provider</label>
                                                            <Select
                                                                value={manualConfig.registrar || DOMAIN_REGISTRARS[0]?.toLowerCase() || ""}
                                                                onValueChange={(v) => onManualConfigChange?.(itemId, { registrar: v })}
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
                                                                id={`send-register-${itemId}`}
                                                                checked={manualConfig.runModuleCreate !== false}
                                                                onCheckedChange={(checked) => onManualConfigChange?.(itemId, { runModuleCreate: checked === true })}
                                                                className="data-[state=checked]:bg-orange-600 border-orange-600/30"
                                                            />
                                                            <label
                                                                htmlFor={`send-register-${itemId}`}
                                                                className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                                            >
                                                                {String(item._raw?.actionType || "").toUpperCase() === "TRANSFER" ? "Run Transfer Module" : "Run Register Module"}
                                                            </label>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`send-domain-email-${itemId}`}
                                                                checked={manualConfig.sendWelcomeEmail !== false}
                                                                onCheckedChange={(checked) => onManualConfigChange?.(itemId, { sendWelcomeEmail: checked === true })}
                                                                className="data-[state=checked]:bg-orange-600 border-orange-600/30"
                                                            />
                                                            <label
                                                                htmlFor={`send-domain-email-${itemId}`}
                                                                className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                                            >
                                                                Send Confirmation Email
                                                            </label>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                            );
                        })()
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
