export type ProductType = "hosting" | "vps" | "domain" | "ssl";
export type PaymentType = "free" | "one-time" | "recurring";

export interface PricingDetail {
    price: number;
    setupFee: number;
    renewPrice: number;
    enable: boolean;
}

export interface CurrencyPricing {
    currency: string;
    // For "recurring"
    monthly: PricingDetail;
    quarterly: PricingDetail;
    semiAnnually: PricingDetail;
    annually: PricingDetail;
    biennially: PricingDetail;
    triennially: PricingDetail;
    // For "one-time" (we can re-use monthly or add specific field, but let's stick to the grid shown)
}

export interface Product {
    id: string;
    name: string;
    type: ProductType;
    group: string;
    description: string;

    // New Pricing Model
    paymentType: PaymentType;
    pricing: CurrencyPricing[]; // Array of pricing for different currencies (BDT, USD)

    stock?: number;
    features: string[];
    // Module Settings
    module?: {
        name: string;
        serverGroup?: string;
        packageName?: string; // e.g. "2 GB BDIX"
    };
    // Free Domain Settings
    freeDomain?: {
        enabled: boolean; // Keep for backward compatibility or computed
        type: "none" | "once" | "recurring";
        paymentTerms?: string[];
        tlds?: string[];
    };
    isHidden: boolean;
    createdAt: string;
}

export interface Order {
    id: string;
    orderNumber: string;
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

export interface Coupon {
    id: string;
    code: string;
    type: "percentage" | "fixed";
    value: number;
    recurring: boolean;
    recurringTimes: number; // 0 = unlimited
    uses: number;
    maxUses: number; // 0 = unlimited
    startDate: string;
    expiryDate: string;
    billingCycles: string[]; // e.g., ["monthly", "annually"]
    domainPeriods: string[]; // e.g., ["1", "2", "3"]
    appliesToProducts: string[]; // Product IDs
    requiresProducts: string[]; // Product IDs
    allowExistingProducts: boolean;
    applyOnce: boolean;
    newSignupsOnly: boolean;
    applyOncePerClient: boolean;
    existingClientOnly: boolean;
    upgradesDowngrades: boolean;
    lifetimePromotion: boolean;
    adminNotes: string;
    status: "active" | "expired";
}

export interface TLDPricingTier {
    year: number;
    register: number;
    renew: number;
    transfer: number;
}

export interface TLD {
    _id: string; // From API
    tld: string;
    register: string; // Registry Name
    serial: number;
    label?: string;
    isSpotlight: boolean;
    pricing: TLDPricingTier[];
    features: {
        dnsManagement: boolean;
        emailForwarding: boolean;
        idProtection: boolean;
    };
    autoRegistration: {
        enabled: boolean;
        provider: string;
    };
    status: "active" | "inactive" | "maintenance";
}
