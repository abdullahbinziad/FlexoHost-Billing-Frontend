/** Mock coupon shape for dev/demo (differs from API Promotion) */
export interface MockCoupon {
    id: string;
    code: string;
    type: "percent" | "fixed";
    value: number;
    recurring: boolean;
    recurringTimes: number;
    uses: number;
    maxUses: number;
    startDate: string;
    expiryDate: string;
    billingCycles: string[];
    domainPeriods: string[];
    appliesToProducts: string[];
    requiresProducts: string[];
    allowExistingProducts: boolean;
    applyOnce: boolean;
    newSignupsOnly: boolean;
    applyOncePerClient: boolean;
    existingClientOnly: boolean;
    upgradesDowngrades: boolean;
    lifetimePromotion: boolean;
    adminNotes: string;
    status: string;
}

export const mockCoupons: MockCoupon[] = [
    {
        id: "hny26",
        code: "HNY26",
        type: "percent",
        value: 30.00,
        recurring: false,
        recurringTimes: 0,
        uses: 3,
        maxUses: 0,
        startDate: "16/10/2025",
        expiryDate: "",
        billingCycles: ["annually"],
        domainPeriods: [],
        appliesToProducts: [],
        requiresProducts: [],
        allowExistingProducts: false,
        applyOnce: false,
        newSignupsOnly: false,
        applyOncePerClient: false,
        existingClientOnly: false,
        upgradesDowngrades: false,
        lifetimePromotion: false,
        adminNotes: "",
        status: "active"
    },
    {
        id: "dfree10",
        code: "DFREE10",
        type: "fixed",
        value: 1699.00,
        recurring: true,
        recurringTimes: 0,
        uses: 2,
        maxUses: 0,
        startDate: "05/09/2025",
        expiryDate: "05/09/2026",
        billingCycles: ["annually"],
        domainPeriods: [],
        appliesToProducts: [],
        requiresProducts: [],
        allowExistingProducts: false,
        applyOnce: false,
        newSignupsOnly: false,
        applyOncePerClient: false,
        existingClientOnly: false,
        upgradesDowngrades: false,
        lifetimePromotion: false,
        adminNotes: "",
        status: "active"
    },
    {
        id: "free3days",
        code: "free3days",
        type: "percent",
        value: 100.00,
        recurring: false,
        recurringTimes: 0,
        uses: 0,
        maxUses: 0,
        startDate: "16/10/2025",
        expiryDate: "",
        billingCycles: [],
        domainPeriods: [],
        appliesToProducts: [],
        requiresProducts: [],
        allowExistingProducts: false,
        applyOnce: false,
        newSignupsOnly: false,
        applyOncePerClient: false,
        existingClientOnly: false,
        upgradesDowngrades: false,
        lifetimePromotion: false,
        adminNotes: "3 days trials",
        status: "active"
    },
    {
        id: "freefirst",
        code: "freefirst",
        type: "percent",
        value: 2470.00,
        recurring: false,
        recurringTimes: 0,
        uses: 0,
        maxUses: 1,
        startDate: "",
        expiryDate: "",
        billingCycles: [],
        domainPeriods: [],
        appliesToProducts: [],
        requiresProducts: [],
        allowExistingProducts: false,
        applyOnce: false,
        newSignupsOnly: false,
        applyOncePerClient: false,
        existingClientOnly: false,
        upgradesDowngrades: false,
        lifetimePromotion: false,
        adminNotes: "",
        status: "active"
    },
    {
        id: "sohagbdix30",
        code: "sohagbdix30",
        type: "percent",
        value: 30.00,
        recurring: false,
        recurringTimes: 1,
        uses: 0,
        maxUses: 1,
        startDate: "20/10/2025",
        expiryDate: "",
        billingCycles: [],
        domainPeriods: [],
        appliesToProducts: [],
        requiresProducts: [],
        allowExistingProducts: false,
        applyOnce: false,
        newSignupsOnly: false,
        applyOncePerClient: false,
        existingClientOnly: false,
        upgradesDowngrades: false,
        lifetimePromotion: false,
        adminNotes: "",
        status: "active"
    }
];
