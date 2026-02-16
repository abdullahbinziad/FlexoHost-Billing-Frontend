"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ClientLogPage() {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Activity Log</CardTitle>
                    <p className="text-sm text-muted-foreground">Audit trail of all actions performed on this client</p>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="whitespace-nowrap text-xs text-gray-500">29/12/2025 15:30</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-900 dark:text-gray-100">Updated Profile Information</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-blue-600">Admin User</span>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">192.168.1.1</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="whitespace-nowrap text-xs text-gray-500">29/12/2025 15:30</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-900 dark:text-gray-100">Email Sent to Client (Profile Updated)</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-purple-600">System</span>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">-</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="whitespace-nowrap text-xs text-gray-500">28/12/2025 10:00</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-900 dark:text-gray-100">Invoice Created #INV-2025-001</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-purple-600">System</span>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">-</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="whitespace-nowrap text-xs text-gray-500">20/12/2025 09:15</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-900 dark:text-gray-100">Successful Login</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-green-600">Client</span>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">103.100.100.100</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
