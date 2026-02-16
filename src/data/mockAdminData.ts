import type { Product, Order } from "@/types/admin";

export const mockAdminProducts: Product[] = [
    {
        id: "p1",
        name: "Starter Hosting",
        type: "hosting",
        group: "Shared Hosting",
        description: "Perfect for personal blogs",
        paymentType: "recurring",
        pricing: [
            {
                currency: "BDT",
                monthly: { price: 150, setupFee: 0, renewPrice: 150, enable: true },
                quarterly: { price: 400, setupFee: 0, renewPrice: 400, enable: true },
                semiAnnually: { price: 750, setupFee: 0, renewPrice: 750, enable: true },
                annually: { price: 1500, setupFee: 0, renewPrice: 1500, enable: true },
                biennially: { price: 2800, setupFee: 0, renewPrice: 2800, enable: true },
                triennially: { price: 0, setupFee: 0, renewPrice: 0, enable: false },
            },
            {
                currency: "USD",
                monthly: { price: 1.5, setupFee: 0, renewPrice: 1.5, enable: true },
                quarterly: { price: 4, setupFee: 0, renewPrice: 4, enable: true },
                semiAnnually: { price: 7.5, setupFee: 0, renewPrice: 7.5, enable: true },
                annually: { price: 15, setupFee: 0, renewPrice: 15, enable: true },
                biennially: { price: 28, setupFee: 0, renewPrice: 28, enable: true },
                triennially: { price: 0, setupFee: 0, renewPrice: 0, enable: false },
            }
        ],
        features: ["5GB SSD", "Unlimited Bandwidth", "1 Domain"],
        isHidden: false,
        createdAt: "2024-01-01T00:00:00Z",
    },
    {
        id: "p2",
        name: "Business Hosting",
        type: "hosting",
        group: "Premium Shared",
        description: "For small businesses",
        paymentType: "recurring",
        pricing: [
            {
                currency: "BDT",
                monthly: { price: 350, setupFee: 0, renewPrice: 350, enable: true },
                quarterly: { price: 1000, setupFee: 0, renewPrice: 1000, enable: true },
                semiAnnually: { price: 1800, setupFee: 0, renewPrice: 1800, enable: true },
                annually: { price: 3500, setupFee: 0, renewPrice: 3500, enable: true },
                biennially: { price: 0, setupFee: 0, renewPrice: 0, enable: false },
                triennially: { price: 0, setupFee: 0, renewPrice: 0, enable: false },
            }
        ],
        features: ["20GB NVMe", "Unlimited Bandwidth", "3 Domains", "Free SSL"],
        isHidden: false,
        createdAt: "2024-01-01T00:00:00Z",
    },
    {
        id: "p3",
        name: "VPS Basic",
        type: "vps",
        group: "Budget VPS",
        description: "Entry level VPS",
        paymentType: "recurring",
        pricing: [
            {
                currency: "BDT",
                monthly: { price: 800, setupFee: 0, renewPrice: 800, enable: true },
                quarterly: { price: 2400, setupFee: 0, renewPrice: 2400, enable: true },
                semiAnnually: { price: 0, setupFee: 0, renewPrice: 0, enable: false },
                annually: { price: 9000, setupFee: 0, renewPrice: 9000, enable: true },
                biennially: { price: 0, setupFee: 0, renewPrice: 0, enable: false },
                triennially: { price: 0, setupFee: 0, renewPrice: 0, enable: false },
            }
        ],
        features: ["2 vCPU", "4GB RAM", "50GB SSD"],
        isHidden: false,
        createdAt: "2024-02-15T00:00:00Z",
    }
];

export const mockAdminOrders: Order[] = [
    {
        id: "191",
        orderNumber: "7410699286",
        userId: "u118",
        userName: "Moshiur Rahman",
        userEmail: "moshiur.r4n@gmail.com",
        clientDetails: {
            address: "Mahimaganj, gobindaganj",
            city: "Gaibandha, Rangpur",
            postcode: "5741",
            state: "",
            country: "Bangladesh",
        },
        items: [
            {
                productId: "p2",
                productName: "Web Hosting - Premium Plan WH",
                price: 2100,
                billingCycle: "Annually",
                domain: "careup.com.bd",
                status: "Pending",
                paymentStatus: "Incomplete",
                username: "careupco",
                password: "*]j68ci8GG8Riw",
                server: "srv1 (71/200)",
            }
        ],
        totalAmount: 2100,
        currency: "BDT",
        status: "pending",
        paymentStatus: "incomplete",
        paymentMethod: "SSLCommerz Online Payment Gateway",
        ipAddress: "192.168.1.1",
        promotionCode: "",
        affiliate: "None - Manual Assign",
        createdAt: "2026-02-06T01:53:00Z",
        invoiceId: "219",
    },
    {
        id: "190",
        orderNumber: "1390359360",
        userId: "u117",
        userName: "shah mojno",
        userEmail: "mojno12@gmail.com",
        items: [
            {
                productId: "p2",
                productName: "Business Hosting",
                price: 3260,
            }
        ],
        totalAmount: 3260,
        currency: "BDT",
        status: "active",
        paymentStatus: "paid",
        paymentMethod: "SSLCommerz",
        ipAddress: "192.168.1.2",
        createdAt: "2026-02-04T14:27:00Z",
        invoiceId: "inv_190",
    },
    {
        id: "189",
        orderNumber: "4885221286",
        userId: "u117",
        userName: "shah mojno",
        userEmail: "mojno12@gmail.com",
        items: [
            {
                productId: "domain",
                productName: "Domain Registration",
                price: 390,
            }
        ],
        totalAmount: 390,
        currency: "BDT",
        status: "cancelled",
        paymentStatus: "paid",
        paymentMethod: "SSLCommerz",
        ipAddress: "192.168.1.2",
        createdAt: "2026-02-04T11:33:00Z",
        invoiceId: "inv_189",
    },
    {
        id: "187",
        orderNumber: "6971278456",
        userId: "u115",
        userName: "Nayeem Ahmed",
        userEmail: "nayeemahmed5320@gmail.com",
        items: [
            {
                productId: "p1",
                productName: "Starter Hosting",
                price: 1950,
            }
        ],
        totalAmount: 1950,
        currency: "BDT",
        status: "active",
        paymentStatus: "paid",
        paymentMethod: "SSLCommerz",
        ipAddress: "103.1.1.1",
        createdAt: "2026-02-01T13:18:00Z",
        invoiceId: "inv_187",
    },
    {
        id: "186",
        orderNumber: "7006639806",
        userId: "u115",
        userName: "Akash Ghosh",
        userEmail: "akash@example.com",
        items: [
            {
                productId: "p1",
                productName: "Starter Hosting",
                price: 1650,
            }
        ],
        totalAmount: 1650,
        currency: "BDT",
        status: "active",
        paymentStatus: "paid",
        paymentMethod: "SSLCommerz",
        ipAddress: "103.1.1.2",
        createdAt: "2026-01-25T14:10:00Z",
        invoiceId: "inv_186",
    },
    {
        id: "181",
        orderNumber: "5526665442",
        userId: "u101",
        userName: "Mr Jahid Hasan Shuvo",
        userEmail: "jahid@example.com",
        items: [
            {
                productId: "misc",
                productName: "Service Charge",
                price: 60,
            }
        ],
        totalAmount: 60,
        currency: "BDT",
        status: "pending",
        paymentStatus: "incomplete",
        paymentMethod: "SSLCommerz",
        ipAddress: "103.1.1.5",
        createdAt: "2026-01-14T12:51:00Z",
        invoiceId: "inv_181",
    }
];
