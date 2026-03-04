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
