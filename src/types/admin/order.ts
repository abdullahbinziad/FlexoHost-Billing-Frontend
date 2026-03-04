export interface Order {
    id: string; // The mongodb _id
    customOrderId?: string; // The counter string like ORD-000001
    orderNumber: string; // The 10 digit random number string
    userId: string;
    userName: string;
    userEmail: string;
    clientDetails?: {
        address: string;
        city: string;
        state: string;
        country: string;
        postcode: string;
    };
    items: {
        productId: string;
        productName: string;
        price: number;
        billingCycle?: string;
        domain?: string;
        status?: string;
        paymentStatus?: string;
        username?: string;
        password?: string;
        server?: string;
    }[];
    totalAmount: number;
    currency: string;
    status: "pending" | "active" | "cancelled" | "fraud";
    paymentStatus: "paid" | "unpaid" | "refunded" | "incomplete";
    paymentMethod: string;
    ipAddress?: string;
    promotionCode?: string;
    affiliate?: string;
    createdAt: string;
    invoiceId?: string;
}
