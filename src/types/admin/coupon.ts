/**
 * Promotion (Coupon) - aligned with backend API
 */
export interface Promotion {
    _id: string;
    code: string;
    name: string;
    description?: string;
    type: "percent" | "fixed";
    value: number;
    currency?: string;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    usagePerClient: number;
    firstOrderOnly: boolean;
    productIds?: string[];
    productTypes?: string[];
    productBillingCycles?: string[];
    domainTlds?: string[];
    domainBillingCycles?: string[];
    isActive: boolean;
    usageCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export type CreatePromotionDTO = Omit<Promotion, "_id" | "usageCount" | "createdAt" | "updatedAt">;
export type UpdatePromotionDTO = Partial<CreatePromotionDTO>;

/** Legacy alias for backward compatibility */
export type Coupon = Promotion;
