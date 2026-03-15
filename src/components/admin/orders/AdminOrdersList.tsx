"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import type { Order } from "@/types/admin";
import { useGetOrdersQuery } from "@/store/api/orderApi";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

export function AdminOrdersList() {
    const formatCurrency = useFormatCurrency();
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchDraft, setSearchDraft] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
    const { data: response, isLoading } = useGetOrdersQuery({
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        paymentStatus: paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
        page: currentPage,
        limit: itemsPerPage,
    });

    // Map backend data to frontend format
    const orders: Order[] = (response?.results || []).map((order: any) => {
        const mappedStatus = order.status?.toLowerCase().replace('_', ' ') || 'pending';
        const mappedPaymentStatus = order.paymentStatus?.toLowerCase() || 'unpaid';

        return {
            id: order._id,
            customOrderId: order.orderId || `ORD-${order._id.slice(-6)}`, // Fallback for old records
            orderNumber: order.orderNumber,
            clientId: order.clientId,
            status: ['pending', 'active', 'cancelled', 'fraud'].includes(mappedStatus) ? mappedStatus : 'pending',
            paymentStatus: ['paid', 'unpaid', 'refunded', 'incomplete'].includes(mappedPaymentStatus) ? mappedPaymentStatus : 'unpaid',
            userName: order.client?.name || 'Unknown',
            userEmail: order.client?.email || '',
            userId: order.userId || 'N/A',
            items: [],
            paymentMethod: order.invoice?.paymentMethod || 'N/A',
            totalAmount: order.invoice?.total || 0,
            currency: order.currency || 'USD',
            createdAt: order.date, // Backend now sends 'date'
            ipAddress: order.meta?.ipAddress || 'N/A',
        } as Order;
    });
    const filteredOrders = orders;
    const totalPages = response?.totalPages ?? 1;
    const totalResults = response?.totalResults ?? 0;

    const updateOrderStatus = (id: string, status: Order["status"]) => {
        // Handle update
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
            {isLoading && (
                <div className="text-center py-4 text-gray-500">Loading orders...</div>
            )}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Orders</h1>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/admin/orders/new">Add New Order</Link>
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-500" />
                        Search / Filter
                    </h2>
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                        <div className="flex-1">
                            <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
                                Search orders
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    className="h-10 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                    placeholder="Search by client name, email, order ID, order number, user ID, IP..."
                                    value={searchDraft}
                                    onChange={(e) => setSearchDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            setSearchTerm(searchDraft);
                                            setCurrentPage(1);
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm(searchDraft);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Search
                                </Button>
                            </div>
                        </div>
                        <div className="w-full xl:w-[180px]">
                            <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
                                Status
                            </label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="fraud">Fraud</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full xl:w-[180px]">
                            <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
                                Payment
                            </label>
                            <Select
                                value={paymentStatusFilter}
                                onValueChange={(value) => {
                                    setPaymentStatusFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="All payments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All payments</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="incomplete">Incomplete</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearchDraft("");
                                setSearchTerm("");
                                setStatusFilter("all");
                                setPaymentStatusFilter("all");
                                setCurrentPage(1);
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <div className="min-w-[980px]">
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
                                    filteredOrders.map((order) => (
                                        <TableRow
                                            key={order.id}
                                            className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                                        >
                                            <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-medium text-blue-600 group-hover:underline">
                                                {order.customOrderId}
                                            </TableCell>
                                            <TableCell className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                                {order.orderNumber}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDate(order.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <button
                                                        type="button"
                                                        className="text-left text-blue-600 font-medium hover:underline z-10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (order.clientId) {
                                                                router.push(`/admin/clients/${order.clientId}`);
                                                            }
                                                        }}
                                                    >
                                                        {order.userName}
                                                    </button>
                                                    <span className="text-xs text-muted-foreground">{order.userEmail}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{order.paymentMethod || 'SSLCommerz'}</TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(order.totalAmount, order.currency)}
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
                <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                    <DataTablePagination
                        page={currentPage}
                        totalPages={totalPages}
                        totalItems={totalResults}
                        pageSize={itemsPerPage}
                        currentCount={filteredOrders.length}
                        itemLabel="records"
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(value) => {
                            setItemsPerPage(value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
