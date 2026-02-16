import { api } from "./baseApi";
import type {
  CheckoutFormData,
  OrderSummary,
  BillingCycleOption,
  ServerLocation,
  Addon,
  BillingContact,
  PaymentMethod,
} from "@/types/checkout";

export interface CreateOrderRequest {
  formData: CheckoutFormData;
  orderSummary: OrderSummary;
}

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
        url: "/checkout/order",
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

    // Search domain availability
    searchDomain: builder.query<
      { available: boolean; price: number; message?: string },
      { domain: string; tld: string }
    >({
      query: ({ domain, tld }) => ({
        url: `/checkout/domain-search`,
        params: { domain, tld },
      }),
    }),
  }),
});

export const {
  useGetCheckoutDataQuery,
  useCreateOrderMutation,
  useValidatePromoCodeMutation,
  useLazySearchDomainQuery,
} = checkoutApi;
