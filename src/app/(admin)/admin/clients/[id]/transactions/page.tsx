"use client";

import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ClientTransactionsPage() {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Transactions</CardTitle>
                    <p className="text-sm text-muted-foreground">Payment history and refunds</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Gateway</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount In</TableHead>
                                <TableHead className="text-right">Amount Out</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium text-blue-600">
                                    <span className="text-xs text-gray-400">#</span>10928
                                </TableCell>
                                <TableCell>2024-01-15</TableCell>
                                <TableCell>PayPal</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>Invoice Payment #INV-2024-001</span>
                                        <span className="text-xs text-gray-500">Trans ID: 9872398273</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium text-green-600">৳1,999.00</TableCell>
                                <TableCell className="text-right font-medium text-gray-400">৳0.00</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-blue-600">
                                    <span className="text-xs text-gray-400">#</span>10500
                                </TableCell>
                                <TableCell>2023-12-20</TableCell>
                                <TableCell>Stripe</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>Invoice Payment #INV-2023-150</span>
                                        <span className="text-xs text-gray-500">Trans ID: ch_123456789</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium text-green-600">৳5,000.00</TableCell>
                                <TableCell className="text-right font-medium text-gray-400">৳0.00</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-blue-600">
                                    <span className="text-xs text-gray-400">#</span>10450
                                </TableCell>
                                <TableCell>2023-12-15</TableCell>
                                <TableCell>Credit Balance</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>Refund for Service cancellation</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium text-gray-400">৳0.00</TableCell>
                                <TableCell className="text-right font-medium text-red-600">৳500.00</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
