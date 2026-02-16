"use client";

import { Button } from "@/components/ui/button";
import { Plus, MapPin, MoreHorizontal, Mail, Phone } from "lucide-react";
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ClientContactsPage() {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Contacts</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage address book and sub-accounts</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Contact
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">Moshiur Rahman</span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> Dhanmondi, Dhaka</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> moshiur.r4n@gmail.com</span>
                                        <span className="text-xs flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3 text-gray-400" /> +880 1700000000</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Owner / Main Contact</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Delete Contact</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">Billing Dept</span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> Banani, Dhaka</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> billing@careup.com</span>
                                        <span className="text-xs flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3 text-gray-400" /> +880 1700000005</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Billing Contact</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Delete Contact</DropdownMenuItem>
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
