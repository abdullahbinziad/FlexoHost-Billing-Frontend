"use client";

import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, Send } from "lucide-react";
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

export default function ClientEmailsPage() {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Email History</CardTitle>
                    <p className="text-sm text-muted-foreground">Log of all emails sent to this client</p>
                </div>
                <Button>
                    <Send className="w-4 h-4 mr-2" />
                    Send General Email
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                <TableHead>Date Sent</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>2024-01-15 10:30 AM</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium">Invoice Payment Confirmation</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8">
                                        View Content
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" title="Resend">
                                        <RefreshCw className="w-3 h-3" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2024-01-01 09:00 AM</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">Account Welcome Email</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8">
                                        View Content
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" title="Resend">
                                        <RefreshCw className="w-3 h-3" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2023-12-25 08:00 AM</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-orange-500" />
                                        <span className="font-medium">Invoice Overdue Notice</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8">
                                        View Content
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" title="Resend">
                                        <RefreshCw className="w-3 h-3" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
