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
    /** A server can belong to multiple groups */
    groups: ("Web Hosting" | "BDIX Hosting" | "Turbo Hosting" | "Ecommerce Hosting" | "VPS" | "BDIX Vps")[];

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

export type ServerGroupOption = ServerConfig["groups"][number];

/** Single source of truth for server group options. Use for server config, product module config, filters, etc. */
export const SERVER_GROUP_OPTIONS: readonly ServerGroupOption[] = [
    "Web Hosting",
    "BDIX Hosting",
    "Turbo Hosting",
    "Ecommerce Hosting",
    "VPS",
    "BDIX Vps",
] as const;

/** Get server groups array (supports legacy single `group` from API). */
export function getServerGroups(server: { groups?: ServerGroupOption[]; group?: string } | null | undefined): ServerGroupOption[] {
    if (!server) return [];
    if (Array.isArray(server.groups) && server.groups.length > 0) return server.groups;
    if ((server as { group?: string }).group) return [(server as { group: string }).group as ServerGroupOption];
    return [];
}
