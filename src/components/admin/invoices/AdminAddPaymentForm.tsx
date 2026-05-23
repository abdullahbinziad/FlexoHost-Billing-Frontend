"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

const PAYMENT_METHODS = [
    { value: "sslcommerz", label: "SSLCommerz Online Payment Gateway" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cash", label: "Cash" },
    { value: "manual", label: "Manual / Other" },
];

interface AdminAddPaymentFormProps {
    currency: string;
    balanceDue: number;
    onSubmit: (data: {
        date: string;
        amount: number;
        paymentMethod: string;
        transactionFees: number;
        transactionId: string;
        sendEmail: boolean;
    }) => Promise<void>;
}

function toDateInputValue(date: Date) {
    return date.toISOString().slice(0, 10);
}

export function AdminAddPaymentForm({
    currency,
    balanceDue,
    onSubmit,
}: AdminAddPaymentFormProps) {
    const formatCurrency = useFormatCurrency();
    const [date, setDate] = useState(toDateInputValue(new Date()));
    const [amount, setAmount] = useState(balanceDue > 0 ? String(balanceDue) : "");
    const [paymentMethod, setPaymentMethod] = useState("sslcommerz");
    const [transactionFees, setTransactionFees] = useState("0.00");
    const [transactionId, setTransactionId] = useState("");
    const [sendEmail, setSendEmail] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(amount) || 0;
        if (amt <= 0) return;
        if (amt > balanceDue) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                date,
                amount: amt,
                paymentMethod,
                transactionFees: Number(transactionFees) || 0,
                transactionId: transactionId.trim(),
                sendEmail,
            });
            setAmount("");
            setTransactionId("");
        } catch {
            // Error handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border bg-card p-6 max-w-lg space-y-5">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Record Payment
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="payment-date">Date</Label>
                        <Input
                            id="payment-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-9"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment-amount">Amount</Label>
                        <Input
                            id="payment-amount"
                            type="number"
                            min={0}
                            step={0.01}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="h-9"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Balance due: {formatCurrency(balanceDue, currency)}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="payment-method" className="h-9">
                            <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAYMENT_METHODS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="transaction-fees">Transaction Fees</Label>
                        <Input
                            id="transaction-fees"
                            type="number"
                            min={0}
                            step={0.01}
                            value={transactionFees}
                            onChange={(e) => setTransactionFees(e.target.value)}
                            placeholder="0.00"
                            className="h-9"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="transaction-id">Transaction ID</Label>
                        <Input
                            id="transaction-id"
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g. TRX123456"
                            className="h-9"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="send-email"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                    />
                    <Label
                        htmlFor="send-email"
                        className="text-sm font-normal cursor-pointer"
                    >
                        Send Email — Check to Send Confirmation Email
                    </Label>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting || !amount || Number(amount) <= 0 || Number(amount) > balanceDue}
                    className="mt-4"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Recording...
                        </>
                    ) : (
                        "Record Payment"
                    )}
                </Button>
            </div>
        </form>
    );
}
