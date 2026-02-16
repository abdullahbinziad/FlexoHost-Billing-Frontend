"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Copy, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientBillableItemsPage() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
                <Copy className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Billable Items</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Billable items allow you to invoice customized or one-off charges to this client.
                </p>
            </div>
            <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Billable Item
            </Button>
        </div>
    );
}
