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
