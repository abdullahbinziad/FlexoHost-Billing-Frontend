"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Server, HardDrive, MoreHorizontal, Globe } from "lucide-react";
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

export default function ClientProductsPage() {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Products & Services</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage hosting packages and services</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Service
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead>Product/Service</TableHead>
                                <TableHead>Pricing</TableHead>
                                <TableHead>Next Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Mock Item 1 */}
                            <TableRow>
                                <TableCell>
                                    <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                        <Server className="w-4 h-4" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <Link href={`products/${123}`} className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 hover:underline">
                                            Premium Shared Hosting
                                        </Link>
                                        <span className="text-xs text-gray-500">domain.com</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">৳5,000.00</span>
                                        <span className="text-xs text-gray-500">Annually</span>
                                    </div>
                                </TableCell>
                                <TableCell>25 Dec, 2026</TableCell>
                                <TableCell>
                                    <Badge className="bg-green-500 text-white hover:bg-green-600">Active</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <Link href={`products/${123}`}>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem>Upgrade/Downgrade</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Request Cancellation</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>

                            {/* Mock Item 2 */}
                            <TableRow>
                                <TableCell>
                                    <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                        <HardDrive className="w-4 h-4" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">VPS Starter</span>
                                        <span className="text-xs text-gray-500">vps.domain.com</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">৳12,000.00</span>
                                        <span className="text-xs text-gray-500">Semi-Annually</span>
                                    </div>
                                </TableCell>
                                <TableCell>10 Jan, 2026</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Suspended</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Unsuspend</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Terminate</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
