export interface ServerConfig {
    id: string;
    // Basic Details
    name: string;
    hostname: string;
    ipAddress: string;
    assignedIpAddresses: string; // Textarea content
    monthlyCost: number;
    datacenter: string;
    maxAccounts: number;
    statusAddress: string;
    isEnabled: boolean;

    // New Fields
    location: "USA" | "Malaysia" | "Singapore" | "Bangladesh" | "Germany" | "Finland";
    group: "Web Hosting" | "BDIX Hosting" | "Turbo Hosting" | "Ecommerce Hosting" | "VPS" | "BDIX Vps";

    // Nameservers
    nameservers: {
        ns1: string; ns1Ip: string;
        ns2: string; ns2Ip: string;
        ns3: string; ns3Ip: string;
        ns4: string; ns4Ip: string;
        ns5: string; ns5Ip: string;
    };

    // Server Details (Module)
    module: {
        type: string;
        username: string;
        password?: string;
        apiToken?: string;
        isSecure: boolean;
        port: number;
        isPortOverride: boolean;
    };

    // Access Control
    accessControl: "unrestricted" | "restricted";

    // Stats (for display)
    stats?: {
        version?: string;
        loadAverage?: string;
        licenseMax?: string;
        lastUpdated?: string;
        whmcsUsage?: string;
        remoteUsage?: string;
    };
}

export interface ServerGroup {
    id: string;
    name: string;
    fillType: "least-full" | "fill-until-full";
    servers: string[]; // Server IDs
}
