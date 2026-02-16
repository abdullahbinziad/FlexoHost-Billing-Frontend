"use client";

import { Card } from "@/components/ui/card"; // Needs card ui
import { Users, ShoppingCart, DollarSign, Activity } from "lucide-react";
import { formatCurrency } from "@/utils/format";

export function AdminStats() {
    const stats = [
        {
            title: "Total Revenue",
            value: formatCurrency(125000, "BDT"),
            change: "+20.1% from last month",
            icon: DollarSign,
        },
        {
            title: "Active Orders",
            value: "25",
            change: "+12 since last week",
            icon: ShoppingCart,
        },
        {
            title: "Active Users",
            value: "201",
            change: "+4 new users today",
            icon: Users,
        },
        {
            title: "Active Services",
            value: "185",
            change: "+8 since yesterday",
            icon: Activity,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.title} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">
                                {stat.title}
                            </h3>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="pt-2">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground pt-1">
                                {stat.change}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
