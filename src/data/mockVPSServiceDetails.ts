import type { VPSServiceDetails } from "@/types/vps-manage";
import { mockHostingServices } from "./mockHostingServices";

// Helper to get base fields from mockHostingServices
const baseService2 = mockHostingServices.find((s) => s.id === "2");
const baseService5 = { ...mockHostingServices[0], id: "5", name: "Premium VPS", productType: "vps" } as any;

export const mockVPSServiceDetails: Record<string, VPSServiceDetails> = {
    "2": {
        ...baseService2!,
        ipAddress: "103.159.202.15",
        hostname: "bd.mattermaze.com",
        os: "Ubuntu",
        osVersion: "22.04 LTS",
        specs: {
            cpu: "4 vCPU",
            ram: "8 GB",
            storage: "120 GB NVMe",
            bandwidth: "5 TB",
        },
        usage: {
            cpuUsage: 45,
            ram: {
                used: 4096,
                total: 8192,
            },
            disk: {
                used: 45,
                total: 120,
            },
            bandwidth: {
                used: 1.2,
                total: 5,
            },
        },
        billing: {
            firstPaymentAmount: 5000,
            recurringAmount: 5000,
            billingCycle: "Annually",
            paymentMethod: "SSLCommerz Online Payment Gateway",
            registrationDate: "2024-11-28",
            nextDueDate: "2025-11-28",
        },
    },
    "5": {
        ...baseService5!,
        identifier: "vps.example.com",
        status: "active",
        ipAddress: "192.168.1.100",
        hostname: "vps.example.com",
        os: "CentOS",
        osVersion: "7",
        specs: {
            cpu: "2 vCPU",
            ram: "4 GB",
            storage: "60 GB SSD",
            bandwidth: "2 TB",
        },
        usage: {
            cpuUsage: 12,
            ram: {
                used: 1024,
                total: 4096,
            },
            disk: {
                used: 10,
                total: 60,
            },
            bandwidth: {
                used: 0.5,
                total: 2,
            },
        },
        billing: {
            firstPaymentAmount: 2500,
            recurringAmount: 2500,
            billingCycle: "Monthly",
            paymentMethod: "Stripe",
            registrationDate: "2025-01-01",
            nextDueDate: "2025-02-01",
        },
    },
};
