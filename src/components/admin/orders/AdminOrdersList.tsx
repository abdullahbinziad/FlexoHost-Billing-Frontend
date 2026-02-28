"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, MoreHorizontal, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockAdminOrders } from "@/data/mockAdminData";
import { formatDate } from "@/utils/format";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import type { Order } from "@/types/admin";

export function AdminOrdersList() {
    const formatCurrency = useFormatCurrency();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>(mockAdminOrders);
    const [isSearchOpen, setIsSearchOpen] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [filters, setFilters] = useState({
        orderId: "",
        orderNumber: "",
        status: "Any",
        paymentStatus: "Any",
        clientName: "",
        minAmount: "",
        maxAmount: "",
        startDate: "",
        endDate: "",
        ipAddress: "",
    });

    // Reset page when filters change
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const filteredOrders = orders.filter((order) => {
        if (filters.orderId && !order.id.toLowerCase().includes(filters.orderId.toLowerCase())) return false;
        if (filters.orderNumber && !order.orderNumber.includes(filters.orderNumber)) return false;
        if (filters.status !== "Any" && order.status !== filters.status.toLowerCase()) return false;
        if (filters.paymentStatus !== "Any" && order.paymentStatus !== filters.paymentStatus.toLowerCase()) return false;
        if (filters.clientName && !order.userName.toLowerCase().includes(filters.clientName.toLowerCase())) return false;
        if (filters.ipAddress && order.ipAddress && !order.ipAddress.includes(filters.ipAddress)) return false;
        return true;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    const updateOrderStatus = (id: string, status: Order["status"]) => {
        setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "pending":
                return "text-red-600 font-medium";
            case "cancelled":
                return "text-gray-500 font-medium";
            case "fraud":
                return "bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-300";
            default:
                return "text-gray-700";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "text-green-600 font-medium";
            case "unpaid":
            case "incomplete":
                return "text-red-500 font-medium";
            case "refunded":
                return "text-orange-500 font-medium";
            default:
                return "text-gray-500";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Orders</h1>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    Add New Order
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300">
                <div
                    className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-500" />
                        Search/Filter
                    </h2>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {isSearchOpen ? <span className="transform rotate-180 transition-transform">▲</span> : <span className="transition-transform">▼</span>}
                    </Button>
                </div>

                {isSearchOpen && (
                    <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 pt-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-right text-gray-500 dark:text-gray-400">Order ID</label>
                                    <Input
                                        className="h-9 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                        value={filters.orderId}
                                        onChange={(e) => handleFilterChange("orderId", e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-right text-gray-500 dark:text-gray-400">Order #</label>
                                    <Input
                                        className="h-9 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                        value={filters.orderNumber}
                                        onChange={(e) => handleFilterChange("orderNumber", e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-right text-gray-500 dark:text-gray-400">Date Range</label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="date"
                                            className="h-9 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800"
                                            value={filters.startDate}
                                            onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                        />
                                        <span className="text-gray-400">-</span>
                                        <Input
                                            type="date"
                                            className="h-9 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800"
                                            value={filters.endDate}
                                            onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-right text-gray-500 dark:text-gray-400">Client</label>
                                    <Input
                                        className="h-9 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                        placeholder="Start Typing to Search Clients"
                                        value={filters.clientName}
                                        onChange={(e) => handleFilterChange("clientName", e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-right text-gray-500 dark:text-gray-400">Payment Status</label>
                                    <select
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filters.paymentStatus}
                                        onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                                    >
                                        <option value="Any">Any</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Unpaid">Unpaid</option>
                                        <option value="Incomplete">Incomplete</option>
                                        <option value="Refunded">Refunded</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-right text-gray-500 dark:text-gray-400">Status</label>
                                    <select
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange("status", e.target.value)}
                                    >
                                        <option value="Any">Any</option>
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Fraud">Fraud</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-right text-gray-500 dark:text-gray-400">IP Address</label>
                                    <Input
                                        className="h-9 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                        value={filters.ipAddress}
                                        onChange={(e) => handleFilterChange("ipAddress", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center pt-6">
                            <Button className="w-40 bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700" variant="outline">
                                <Search className="w-4 h-4 mr-2" /> Search
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground bg-white dark:bg-gray-900 p-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
                <span className="font-medium">
                    {filteredOrders.length > 0 ? (
                        <>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} Records</>
                    ) : (
                        "0 Records Found"
                    )}
                </span>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                        <span>Per Page:</span>
                        <select
                            className="h-8 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 text-xs font-medium"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </Button>
                            <div className="flex items-center px-2">
                                <span className="text-xs font-medium">Page {currentPage} of {totalPages}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-[#1e40af]">
                        <TableRow className="border-b-0 hover:bg-[#1e40af]">
                            <TableHead className="w-[40px] text-white/90 py-3"><Checkbox className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-[#1e40af]" /></TableHead>
                            <TableHead className="text-white font-semibold py-3 h-auto">ID</TableHead>
                            <TableHead className="text-white font-semibold py-3 h-auto">Order #</TableHead>
                            <TableHead className="text-white font-semibold py-3 h-auto">Date</TableHead>
                            <TableHead className="text-white font-semibold py-3 h-auto">Client Name</TableHead>
                            <TableHead className="text-white font-semibold py-3 h-auto">Payment Method</TableHead>
                            <TableHead className="text-white font-semibold py-3 h-auto">Total</TableHead>
                            <TableHead className="text-white font-semibold py-3 h-auto">Payment Status</TableHead>
                            <TableHead className="text-white font-semibold py-3 h-auto">Status</TableHead>
                            <TableHead className="text-white font-semibold w-[50px] py-3 h-auto"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={10}
                                    className="text-center h-32 text-muted-foreground"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p>No orders found matching your search.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedOrders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                >
                                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs font-medium text-blue-600 group-hover:underline">
                                        {order.id}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {order.orderNumber}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDate(order.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span
                                                className="text-blue-600 font-medium hover:underline z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Navigate to client profile logic here if needed
                                                }}
                                            >
                                                {order.userName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{order.userEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{order.paymentMethod || 'SSLCommerz'}</TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(order.totalAmount)}
                                    </TableCell>
                                    <TableCell className={getPaymentStatusColor(order.paymentStatus)}>
                                        <Badge variant="outline" className={`border-0 bg-transparent px-0 font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {order.paymentStatus === 'incomplete' ? 'Incomplete' :
                                                order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={`rounded-sm font-normal px-2 ${getStatusColor(order.status).replace('text-', 'text-').replace('bg-', 'bg-')}`}
                                        >
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-600 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Handle delete
                                            }}
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
