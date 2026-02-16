"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Printer, Send, CreditCard, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InvoiceDetailsPage({ params }: { params: { id: string; invoiceId: string } }) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <div>
                <Button
                    variant="ghost"
                    className="pl-0 hover:pl-2 transition-all"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Invoices
                </Button>
            </div>

            {/* Title Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        Invoice #{params.invoiceId}
                        <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Created: 15 Jan, 2024 • Due: 22 Jan, 2024</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Mark Unpaid</DropdownMenuItem>
                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete Invoice</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Invoice Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Invoice Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-8">
                            {/* Header */}
                            <div className="flex justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">FlexoHost Ltd.</h2>
                                    <div className="text-sm text-gray-500 space-y-0.5">
                                        <p>123 Web Hosting Street</p>
                                        <p>Dhaka, Bangladesh</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">INVOICE</h3>
                                    <p className="text-sm font-medium text-gray-500">#INV-{params.invoiceId}</p>
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="mb-8">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Invoiced To</h3>
                                <h2 className="font-bold text-gray-900 dark:text-gray-100">Moshiur Rahman</h2>
                                <div className="text-sm text-gray-500 space-y-0.5">
                                    <p>CareUp Beauty Store</p>
                                    <p>Dhanmondi, Dhaka</p>
                                    <p>Bangladesh</p>
                                </div>
                            </div>

                            {/* Line Items */}
                            <Table className="mb-8">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <div className="font-medium">Premium Shared Hosting - Annually</div>
                                            <div className="text-xs text-gray-500">nazrulinstitute.com (15/01/2024 - 14/01/2025)</div>
                                        </TableCell>
                                        <TableCell className="text-right">৳1,999.00</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <div className="font-medium">Free Domain Registration</div>
                                            <div className="text-xs text-gray-500">nazrulinstitute.com (1 Year)</div>
                                        </TableCell>
                                        <TableCell className="text-right">৳0.00</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>

                            {/* Summary */}
                            <div className="flex flex-col items-end space-y-2 text-sm">
                                <div className="flex justify-between w-48">
                                    <span className="text-gray-500">Subtotal:</span>
                                    <span className="font-medium">৳1,999.00</span>
                                </div>
                                <div className="flex justify-between w-48">
                                    <span className="text-gray-500">Tax (0%):</span>
                                    <span className="font-medium">৳0.00</span>
                                </div>
                                <div className="flex justify-between w-48 text-base font-bold text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">
                                    <span>Total:</span>
                                    <span>৳1,999.00</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className="font-medium text-green-600">Paid</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Method</span>
                                <span className="font-medium">SSLCommerz</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Date Paid</span>
                                <span className="font-medium">15 Jan, 2024</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Transaction ID</span>
                                <span className="font-mono text-xs">TXN_9872938</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button className="w-full justify-start" variant="secondary">
                                <Send className="w-4 h-4 mr-2" /> Email Invoice
                            </Button>
                            <Button className="w-full justify-start" variant="secondary">
                                <CreditCard className="w-4 h-4 mr-2" /> Refund Payment
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
