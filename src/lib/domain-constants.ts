import { TLDCurrencyPricing, TLDPricingDetail } from "@/types/admin";

export const defaultPricingDetail: TLDPricingDetail = {
    register: 0,
    renew: 0,
    transfer: 0,
    enable: true,
};

export const defaultCurrencyPricing = (currency: string): TLDCurrencyPricing => ({
    currency,
    "1": { ...defaultPricingDetail },
    "2": { ...defaultPricingDetail },
    "3": { ...defaultPricingDetail },
});
