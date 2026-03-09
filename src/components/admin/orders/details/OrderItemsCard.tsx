import { useState, useEffect } from "react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Creds = { username: string; password: string };

function domainToUsername(domain: string) {
    const clean = (domain || "")
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];

    const sld = clean.split(".")[0] || "user";
    const base = sld.replace(/[^a-z0-9]/g, "");
    return (base || "user").slice(0, 10);
}

function generatePassword(length = 14) {
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
    const nums = "23456789";
    const sym = "!@#$%&*_-?";

    const all = lower + upper + nums + sym;
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

    let pwd = pick(lower) + pick(upper) + pick(nums) + pick(sym);
    for (let i = pwd.length; i < length; i++) pwd += pick(all);

    return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

function buildDefaultCreds(domain: string): Creds {
    const base = domainToUsername(domain);
    const suffix = Math.floor(100 + Math.random() * 900);
    return {
        username: `${base}${suffix}`.slice(0, 16),
        password: generatePassword(14),
    };
}

interface OrderItemsCardProps {
    order: any;
}

export function OrderItemsCard({ order }: OrderItemsCardProps) {
    const formatCurrency = useFormatCurrency();
    const [itemCreds, setItemCreds] = useState<Record<number, Creds>>({});

    useEffect(() => {
        if (!order?.items?.length) return;

        setItemCreds((prev) => {
            const next = { ...prev };

            (order.items || []).forEach((item: any, index: number) => {
                if (item.type !== "HOSTING") return;

                const domain =
                    item.domain ||
                    item.configSnapshot?.domainName ||
                    item.configSnapshot?.primaryDomain ||
                    "";

                const existingUsername = item.username || "";
                const existingPassword = item.password || "";

                if (existingUsername && existingPassword) {
                    next[index] = { username: existingUsername, password: existingPassword };
                    return;
                }

                if (!next[index]) {
                    next[index] = buildDefaultCreds(domain);
                }
            });

            return next;
        });
    }, [order?.id, order?.items]);

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

                                    {/* HOSTING Config */}
                                    {(item.type === "HOSTING" || item.username || item.password || item.server) && (
                                        <div className="bg-blue-600/5 rounded-lg border border-blue-600/10 p-4 mt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-gray-500">Username</label>
                                                    <Input
                                                        className="h-8 bg-white"
                                                        value={itemCreds[index]?.username ?? item.username ?? ""}
                                                        onChange={(e) =>
                                                            setItemCreds((prev) => ({
                                                                ...prev,
                                                                [index]: {
                                                                    ...(prev[index] ?? { username: "", password: "" }),
                                                                    username: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-gray-500">Password</label>
                                                    <Input
                                                        className="h-8 bg-white"
                                                        value={itemCreds[index]?.password ?? item.password ?? ""}
                                                        onChange={(e) =>
                                                            setItemCreds((prev) => ({
                                                                ...prev,
                                                                [index]: {
                                                                    ...(prev[index] ?? { username: "", password: "" }),
                                                                    password: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-medium text-gray-500">Server</label>
                                                        {item.type === "HOSTING" && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs"
                                                                onClick={() => {
                                                                    const domain = item.domain || "";
                                                                    setItemCreds((prev) => ({ ...prev, [index]: buildDefaultCreds(domain) }));
                                                                }}
                                                            >
                                                                Generate
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <Select defaultValue={item.server || "server1"}>
                                                        <SelectTrigger className="h-8 bg-white">
                                                            <SelectValue placeholder="Select Server" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="server1">Main Server 01</SelectItem>
                                                            <SelectItem value="server2">Backup Server 02</SelectItem>
                                                            <SelectItem value="server-usa">USA Node 01</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-6 mt-4 pt-3 border-t border-blue-600/10">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`run-module-${index}`}
                                                        defaultChecked
                                                        className="data-[state=checked]:bg-blue-600 border-blue-600/30"
                                                    />
                                                    <label
                                                        htmlFor={`run-module-${index}`}
                                                        className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Run Module Create
                                                    </label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`send-email-${index}`}
                                                        defaultChecked
                                                        className="data-[state=checked]:bg-blue-600 border-blue-600/30"
                                                    />
                                                    <label
                                                        htmlFor={`send-email-${index}`}
                                                        className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Send Welcome Email
                                                    </label>
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
                                                    <Select defaultValue="dynadot">
                                                        <SelectTrigger className="h-8 bg-white">
                                                            <SelectValue placeholder="Select Provider" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="dynadot">Dynadot</SelectItem>
                                                            <SelectItem value="namilo">Nameilo</SelectItem>
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
