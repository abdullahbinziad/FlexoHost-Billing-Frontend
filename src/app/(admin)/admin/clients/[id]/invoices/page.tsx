"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MoreHorizontal, FileText, Download } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ClientInvoicesPage() {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Invoices</CardTitle>
                    <p className="text-sm text-muted-foreground">Billing history and unpaid invoices</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        Batch PDF Export
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                <TableHead className="w-[100px]">Invoice #</TableHead>
                                <TableHead>Date Created</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium text-blue-600">
                                    <Link href="invoices/INV-001" className="hover:underline">
                                        #INV-2024-001
                                    </Link>
                                </TableCell>
                                <TableCell>2024-01-15</TableCell>
                                <TableCell>2024-01-22</TableCell>
                                <TableCell className="font-semibold">৳1,999.00</TableCell>
                                <TableCell>
                                    <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href="invoices/INV-001">
                                                    <DropdownMenuItem>View Invoice</DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                                <DropdownMenuItem>Refund</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-blue-600">
                                    <Link href="invoices/INV-005" className="hover:underline">
                                        #INV-2024-005
                                    </Link>
                                </TableCell>
                                <TableCell>2024-02-01</TableCell>
                                <TableCell>2024-02-08</TableCell>
                                <TableCell className="font-semibold">৳500.00</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900">Unpaid</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Mark Paid</DropdownMenuItem>
                                                <DropdownMenuItem>View Invoice</DropdownMenuItem>
                                                <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">Mark Cancelled</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
