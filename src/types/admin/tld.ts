export interface TLDPricingDetail {
    register: number;
    renew: number;
    transfer: number;
    enable: boolean;
}

export interface TLDCurrencyPricing {
    currency: string;
    "1": TLDPricingDetail;
    "2": TLDPricingDetail;
    "3": TLDPricingDetail;
}

export interface TLD {
    _id: string; // From API
    tld: string;
    serial: number;
    label?: string;
    isSpotlight: boolean;
    pricing: TLDCurrencyPricing[];
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
