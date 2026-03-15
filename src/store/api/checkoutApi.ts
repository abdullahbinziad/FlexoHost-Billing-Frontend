import { api } from "./baseApi";
import type { ApiResponse } from "@/types/api";
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
  order: {
    orderId: string;
    orderNumber: string;
    total: number;
    currency: string;
  };
  invoiceId?: string; // Omitted when generateInvoice=false
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

export interface DomainSearchApiResponse {
  domain: string;
  extension: string;
  registrar?: string;
  available?: boolean;
  price?: number;
  currency?: string;
  premium?: boolean;
  registrarResult?: {
    domain?: string;
    available?: boolean | "Yes" | "No" | string;
    price?: number;
    currency?: string;
    premium?: boolean;
  };
  dynadotResult?: {
    domain?: string;
    available?: boolean | "Yes" | "No" | string;
    price?: number;
    currency?: string;
    premium?: boolean;
  };
  tldData?: any;
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
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["Order", "Invoice"],
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

    searchDomain: builder.query<DomainSearchApiResponse, string>({
      query: (fullDomain) => {
        return {
          url: `/domains/search`,
          params: { domain: fullDomain },
        };
      },
      transformResponse: (response: ApiResponse<DomainSearchApiResponse>) => response.data,
    }),
  }),
});

export const {
  useGetCheckoutDataQuery,
  useCreateOrderMutation,
  useValidatePromoCodeMutation,
  useLazySearchDomainQuery,
} = checkoutApi;
