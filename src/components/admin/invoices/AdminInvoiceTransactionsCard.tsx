"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface Transaction {
    date?: string;
    paymentMethod?: string;
    transactionId?: string;
    amount?: number;
    fees?: number;
}

interface AdminInvoiceTransactionsCardProps {
    title: string;
    transactions: Transaction[];
    columns?: ("date" | "paymentMethod" | "transactionId" | "amount" | "fees" | "status" | "description")[];
    currency?: string;
}

export function AdminInvoiceTransactionsCard({
    title,
    transactions,
    columns = ["date", "paymentMethod", "transactionId", "amount", "fees"],
    currency,
}: AdminInvoiceTransactionsCardProps) {
    const formatCurrency = useFormatCurrency();

    const formatDate = (d: string | undefined) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {title}
            </h3>
            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            {columns.includes("date") && <TableHead className="font-medium">Date</TableHead>}
                            {columns.includes("paymentMethod") && (
                                <TableHead className="font-medium">Payment Method</TableHead>
                            )}
                            {columns.includes("transactionId") && (
                                <TableHead className="font-medium">Transaction ID</TableHead>
                            )}
                            {columns.includes("amount") && (
                                <TableHead className="font-medium text-right">Amount</TableHead>
                            )}
                            {columns.includes("fees") && (
                                <TableHead className="font-medium text-right">Fees</TableHead>
                            )}
                            {columns.includes("status") && (
                                <TableHead className="font-medium">Status</TableHead>
                            )}
                            {columns.includes("description") && (
                                <TableHead className="font-medium">Description</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!transactions || transactions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-20 text-center text-muted-foreground"
                                >
                                    No records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx, idx) => (
                                <TableRow key={idx}>
                                    {columns.includes("date") && (
                                        <TableCell>{formatDate(tx.date)}</TableCell>
                                    )}
                                    {columns.includes("paymentMethod") && (
                                        <TableCell>{tx.paymentMethod || "—"}</TableCell>
                                    )}
                                    {columns.includes("transactionId") && (
                                        <TableCell>{tx.transactionId || "—"}</TableCell>
                                    )}
                                    {columns.includes("amount") && (
                                        <TableCell className="text-right">
                                            {tx.amount != null
                                                ? formatCurrency(tx.amount, currency)
                                                : "—"}
                                        </TableCell>
                                    )}
                                    {columns.includes("fees") && (
                                        <TableCell className="text-right">
                                            {tx.fees != null
                                                ? formatCurrency(tx.fees, currency)
                                                : "—"}
                                        </TableCell>
                                    )}
                                    {columns.includes("status") && (
                                        <TableCell>{(tx as any).status || "—"}</TableCell>
                                    )}
                                    {columns.includes("description") && (
                                        <TableCell>{(tx as any).description || "—"}</TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
