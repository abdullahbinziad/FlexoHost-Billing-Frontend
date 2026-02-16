"use client";

//demo

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MoreHorizontal, MessageSquare } from "lucide-react";
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

export default function ClientTicketsPage() {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Support Tickets</CardTitle>
                    <p className="text-sm text-muted-foreground">Support requests and communication history</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Open New Ticket
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                <TableHead className="w-[100px]">Ticket #</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium text-blue-600">
                                    <Link href="tickets/8921" className="hover:underline">
                                        #8921
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">Server is very slow today</span>
                                        <span className="text-xs text-gray-500">Service: Primary Hosting</span>
                                    </div>
                                </TableCell>
                                <TableCell>Technical Support</TableCell>
                                <TableCell>Just now</TableCell>
                                <TableCell>
                                    <Badge className="bg-green-500 hover:bg-green-600">Open</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8">
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-blue-600">
                                    <Link href="tickets/8500" className="hover:underline">
                                        #8500
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">Billing Question about Invoice #2024-001</span>
                                    </div>
                                </TableCell>
                                <TableCell>Billing</TableCell>
                                <TableCell>2 days ago</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">Customer Reply</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8">
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-blue-600">
                                    <Link href="tickets/8100" className="hover:underline">
                                        #8100
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-gray-100 dark:text-gray-400 text-gray-500">Pre-sales question</span>
                                    </div>
                                </TableCell>
                                <TableCell>Sales</TableCell>
                                <TableCell>1 month ago</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-gray-500 border-gray-300">Closed</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8">
                                        View
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
