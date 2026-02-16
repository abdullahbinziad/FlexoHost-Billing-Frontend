"use client";

import { Button } from "@/components/ui/button";
import { Plus, User, MoreHorizontal, Shield } from "lucide-react";
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

export default function ClientUsersPage() {
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Associated Users</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage users who can access this client profile</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Invite New User
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead>User Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">Moshiur Rahman (Owner)</TableCell>
                                <TableCell>moshiur.r4n@gmail.com</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">All Permissions</Badge>
                                </TableCell>
                                <TableCell>2 mins ago</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
                                            <DropdownMenuItem>Change Password</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Remove Access</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">Support Staff</TableCell>
                                <TableCell>support@careup.com</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Limited</Badge>
                                </TableCell>
                                <TableCell>1 month ago</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
                                            <DropdownMenuItem>Change Password</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Remove Access</DropdownMenuItem>
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
