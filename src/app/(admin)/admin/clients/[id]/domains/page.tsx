"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MoreHorizontal, Globe } from "lucide-react";
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

export default function ClientDomainsPage() {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Domains</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage registered domains</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Register New Domain
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead>Domain Address</TableHead>
                                <TableHead>Registrar</TableHead>
                                <TableHead>Registration Date</TableHead>
                                <TableHead>Next Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <Link href="domains/mybusinessc.com" className="font-semibold text-blue-600 hover:underline">
                                            mybusinessc.com
                                        </Link>
                                        <span className="text-xs text-gray-500">Auto Renew: On</span>
                                    </div>
                                </TableCell>
                                <TableCell>NameCheap</TableCell>
                                <TableCell>12 Jan, 2024</TableCell>
                                <TableCell>12 Jan, 2025</TableCell>
                                <TableCell>
                                    <Badge className="bg-green-500 text-white hover:bg-green-600">Active</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href="domains/mybusinessc.com">
                                            <Button variant="ghost" size="sm" className="h-8">
                                                View
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Manage Nameservers</DropdownMenuItem>
                                                <DropdownMenuItem>Edit Contact Info</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>Renew Domain</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <Link href="domains/old-project.net" className="font-semibold text-blue-600 hover:underline">
                                            old-project.net
                                        </Link>
                                        <span className="text-xs text-gray-500">Auto Renew: Off</span>
                                    </div>
                                </TableCell>
                                <TableCell>GoDaddy</TableCell>
                                <TableCell>05 Mar, 2021</TableCell>
                                <TableCell className="text-red-500 font-medium">05 Mar, 2024 (Expired)</TableCell>
                                <TableCell>
                                    <Badge variant="destructive">Expired</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href="domains/old-project.net">
                                            <Button variant="ghost" size="sm" className="h-8">
                                                View
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Manage Nameservers</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Delete from System</DropdownMenuItem>
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
