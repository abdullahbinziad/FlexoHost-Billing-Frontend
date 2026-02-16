import type { HostingService } from "./hosting";

export interface VPSServiceDetails extends HostingService {
    ipAddress: string;
    hostname: string;
    os: string;
    osVersion: string;
    rootPassword?: string; // Optional, usually hidden or fetched on demand
    specs: {
        cpu: string; // e.g., "2 vCPU"
        ram: string; // e.g., "4 GB"
        storage: string; // e.g., "80 GB NVMe"
        bandwidth: string; // e.g., "4 TB"
    };
    usage: {
        cpuUsage: number; // Percentage 0-100
        ram: {
            used: number; // in MB
            total: number; // in MB
        };
        disk: {
            used: number; // in GB
            total: number; // in GB
        };
        bandwidth: {
            used: number; // in GB
            total: number; // in GB
        };
    };
    billing: {
        firstPaymentAmount: number;
        recurringAmount: number;
        billingCycle: string;
        paymentMethod: string;
        registrationDate: string;
        nextDueDate: string;
    };
}
