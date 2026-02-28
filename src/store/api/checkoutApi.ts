import { api } from "./baseApi";
import type {
  CreateOrderPayload,
  BillingCycleOption,
  ServerLocation,
  Addon,
  BillingContact,
  PaymentMethod,
} from "@/types/checkout";

export type CreateOrderRequest = CreateOrderPayload;

export interface CreateOrderResponse {
  orderId: string;
  status: "pending" | "processing" | "completed" | "failed";
  paymentUrl?: string;
  message: string;
}

export interface ValidatePromoCodeRequest {
  code: string;
  orderTotal: number;
}

export interface ValidatePromoCodeResponse {
  valid: boolean;
  discount: number;
  discountPercentage: number;
  message?: string;
}

export interface GetCheckoutDataResponse {
  billingCycleOptions: BillingCycleOption[];
  serverLocations: ServerLocation[];
  availableAddons: Addon[];
  billingContacts: BillingContact[];
  paymentMethods: PaymentMethod[];
}

export const checkoutApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get checkout configuration data
    getCheckoutData: builder.query<GetCheckoutDataResponse, void>({
      query: () => "/checkout/data",
      providesTags: ["Product", "Order"],
    }),

    // Create order
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (data) => ({
        url: "/orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),

    // Validate promo code
    validatePromoCode: builder.mutation<
      ValidatePromoCodeResponse,
      ValidatePromoCodeRequest
    >({
      query: (data) => ({
        url: "/checkout/validate-promo",
        method: "POST",
        body: data,
      }),
    }),

    searchDomain: builder.query<
      { available: boolean; price: number; message?: string; pricing?: { USD: number; BDT: number } },
      { domain: string; tld: string }
    >({
      query: ({ domain, tld }) => {
        const fullDomain = `${domain}${tld}`;

        console.log("Searching domain:", fullDomain);

        return {
          url: `/domains/search`,
          params: { domain: fullDomain },
        };
      },
    }),
  }),
});

export const {
  useGetCheckoutDataQuery,
  useCreateOrderMutation,
  useValidatePromoCodeMutation,
  useLazySearchDomainQuery,
} = checkoutApi;
