"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Filter, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Mock Data matching the screenshot
const initialClients = [
    {
        id: 118,
        firstName: "Moshiur",
        lastName: "Rahman",
        companyName: "CareUp Beauty Store",
        email: "moshiur.r4n@gmail.com",
        services: "0 (1)",
        created: "06/02/2026",
        status: "Active",
    },
    {
        id: 117,
        firstName: "shah",
        lastName: "mojno",
        companyName: "",
        email: "mojno12@gmail.com",
        services: "2 (2)",
        created: "04/02/2026",
        status: "Active",
    },
    {
        id: 115,
        firstName: "Nayeem",
        lastName: "Ahmed",
        companyName: "Zulfiqar BD",
        email: "nayeemahmed5320@gmail.com",
        services: "1 (1)",
        created: "01/02/2026",
        status: "Active",
    },
    {
        id: 113,
        firstName: "Omar",
        lastName: "Faruque",
        companyName: "Abu Motors",
        email: "omar401tech@gmail.com",
        services: "2 (2)",
        created: "24/01/2026",
        status: "Active",
    },
    {
        id: 112,
        firstName: "Abdus Salam",
        lastName: "Chowdhury",
        companyName: "Salam & Brothers",
        email: "sbsuchana@yahoo.com",
        services: "2 (2)",
        created: "19/01/2026",
        status: "Active",
    },
];

export default function ViewSearchClients() {
    const [searchTerm, setSearchTerm] = useState("");
    const [clients, setClients] = useState(initialClients);

    const handleSearch = () => {
        // Implement filtering logic here usually
        console.log("Searching...");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    View/Search Clients
                </h1>
            </div>

            {/* Search Filter Section */}
            <Card className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Client/Company Name
                            </label>
                            <Input placeholder="" className="bg-white dark:bg-background" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Email Address
                            </label>
                            <Input placeholder="" className="bg-white dark:bg-background" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Phone Number
                            </label>
                            <div className="flex gap-2">
                                <select className="w-[80px] bg-white dark:bg-background border rounded-md">
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+880">🇧🇩 +880</option>
                                </select>
                                <Input placeholder="201-555-0123" className="flex-1 bg-white dark:bg-background" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Client Group
                            </label>
                            <select className="w-full bg-white dark:bg-background border rounded-md h-10 px-3">
                                <option>Any</option>
                                <option>Default</option>
                                <option>VIP</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto mt-4 lg:mt-0">
                        <div className="space-y-2 flex-1 lg:flex-none lg:w-48">
                            <label className="text-sm font-medium text-muted-foreground">
                                Status
                            </label>
                            <select className="w-full bg-white dark:bg-background border rounded-md h-10 px-3">
                                <option>Any</option>
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>Closed</option>
                            </select>
                        </div>

                        <div className="flex gap-2 items-end">
                            <Button variant="outline" className="bg-white dark:bg-background">
                                <Plus className="w-4 h-4 mr-2" /> Advanced
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Search className="w-4 h-4 mr-2" /> Search
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Results Info Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground bg-white dark:bg-gray-900 p-2 rounded-md border border-dashed border-gray-200 dark:border-gray-800">
                <span>70 Records Found, Showing 1 to 70</span>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                        <span>Jump to Page:</span>
                        <select className="w-16 h-8 text-xs bg-blue-600 text-white border-blue-600 font-bold rounded-md px-1">
                            <option>ON</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Hide Inactive Clients (26)</span>
                        <select className="w-12 h-8 text-xs border rounded-md px-1 bg-white dark:bg-gray-800">
                            <option>1</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Clients Table */}
            <div className="rounded-md border bg-white dark:bg-gray-900">
                <Table>
                    <TableHeader className="bg-blue-900">
                        <TableRow className="hover:bg-blue-900/90 border-none">
                            <TableHead className="w-[40px] text-white"><Checkbox className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-blue-900" /></TableHead>
                            <TableHead className="w-[80px] text-white">
                                <div className="flex items-center gap-1 cursor-pointer">
                                    ID <ChevronDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="text-white font-semibold">First Name</TableHead>
                            <TableHead className="text-white font-semibold">Last Name</TableHead>
                            <TableHead className="text-white font-semibold">Company Name</TableHead>
                            <TableHead className="text-white font-semibold">Email Address</TableHead>
                            <TableHead className="text-white font-semibold">Services</TableHead>
                            <TableHead className="text-white font-semibold">Created</TableHead>
                            <TableHead className="text-right text-white font-semibold pr-4">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <TableCell><Checkbox /></TableCell>
                                <TableCell className="font-medium text-blue-600">
                                    <Link href={`/admin/clients/${client.id}`} className="hover:underline">
                                        {client.id}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-blue-600 font-medium">
                                    <Link href={`/admin/clients/${client.id}`} className="hover:underline">
                                        {client.firstName}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-blue-600 font-medium">
                                    <Link href={`/admin/clients/${client.id}`} className="hover:underline">
                                        {client.lastName}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-gray-600 dark:text-gray-300">
                                    <Link href={`/admin/clients/${client.id}`} className="hover:underline">
                                        {client.companyName || '-'}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-blue-600">
                                    <Link href={`/admin/clients/${client.id}`} className="hover:underline">
                                        {client.email}
                                    </Link>
                                </TableCell>
                                <TableCell>{client.services}</TableCell>
                                <TableCell className="text-gray-500">{client.created}</TableCell>
                                <TableCell className="text-right pr-4">
                                    <Badge className="bg-green-500 hover:bg-green-600 uppercase text-[10px] px-1.5 py-0.5 rounded-sm">
                                        {client.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
