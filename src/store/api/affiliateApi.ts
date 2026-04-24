import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";

export interface AffiliateSummaryCurrency {
  qualified: number;
  approved: number;
  payoutRequested: number;
  credited: number;
  paidOut: number;
  reversed: number;
  totalEarned: number;
}

export interface AffiliateSettings {
  _id: string;
  defaultCommissionRate: number;
  defaultReferralDiscountRate: number;
  defaultPayoutThreshold: number;
}

export interface AffiliateProfile {
  _id: string;
  referralCode: string;
  status: string;
  commissionRate: number;
  referralDiscountRate: number;
  payoutThreshold: number;
  preferredCurrency: string;
  referredClientsCount: number;
  totals: {
    qualified: number;
    approved: number;
    payoutRequested: number;
    credited: number;
    paidOut: number;
    reversed: number;
  };
  payoutDetails?: {
    method?: string;
    accountName?: string;
    accountNumber?: string;
    provider?: string;
    notes?: string;
  };
  referralLink: string;
}

export interface AffiliateReferralItem {
  _id: string;
  referredClientObjectId?: string;
  referralCode: string;
  source: string;
  status: string;
  createdAt: string;
  qualifiedAt?: string;
  referredClientId?: {
    clientId?: number;
    firstName?: string;
    lastName?: string;
    contactEmail?: string;
  };
}

export interface AffiliateCommissionItem {
  _id: string;
  referralId?: string;
  referredClientId?: string;
  referralCode: string;
  status: string;
  currency: string;
  orderNetAmount: number;
  discountAmount: number;
  commissionAmount: number;
  refundWindowDays: number;
  qualifiedAt: string;
  availableAt: string;
  approvedAt?: string;
  redeemedAt?: string;
  reversedAt?: string;
  notes?: string;
}

export interface AffiliatePayoutRequestItem {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  requestedAt: string;
  reviewedAt?: string;
  paidAt?: string;
  reviewNotes?: string;
  payoutDetails?: {
    method?: string;
    accountName?: string;
    accountNumber?: string;
    provider?: string;
    notes?: string;
  };
  affiliateClientId?: {
    clientId?: number;
    firstName?: string;
    lastName?: string;
    contactEmail?: string;
  };
  affiliateProfileId?: {
    referralCode?: string;
  };
}

export interface MyAffiliateDashboardResponse {
  enrolled: boolean;
  profile?: AffiliateProfile;
  summaryByCurrency?: Record<string, AffiliateSummaryCurrency>;
  referrals?: AffiliateReferralItem[];
  commissions?: AffiliateCommissionItem[];
  payoutRequests?: AffiliatePayoutRequestItem[];
  clientCreditBalance: number;
  clientCreditCurrency: string;
}

export interface AdminAffiliateDashboardResponse {
  settings: AffiliateSettings;
  payoutRequests: AffiliatePayoutRequestItem[];
  recentTransactionsByInvoice: Record<string, string>;
}

export interface AdminClientAffiliateResponse extends MyAffiliateDashboardResponse {
  client: {
    _id: string;
    clientId?: number;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    contactEmail?: string;
  };
}

export const affiliateApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMyAffiliateDashboard: builder.query<MyAffiliateDashboardResponse, void>({
      query: () => "/affiliate/me",
      transformResponse: (response: ApiResponse<MyAffiliateDashboardResponse>) => response.data,
      providesTags: [{ type: "Affiliate", id: "ME" }],
    }),
    enrollAffiliate: builder.mutation<{ profile: AffiliateProfile; referralLink: string }, void>({
      query: () => ({
        url: "/affiliate/enroll",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ profile: AffiliateProfile; referralLink: string }>) => response.data,
      invalidatesTags: [{ type: "Affiliate", id: "ME" }],
    }),
    redeemAffiliateCredit: builder.mutation<
      { redeemedAmount: number; currency: string; accountCreditBalance: number; accountCreditCurrency: string },
      { amount: number; currency?: string }
    >({
      query: (body) => ({
        url: "/affiliate/me/redeem-credit",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      invalidatesTags: [{ type: "Affiliate", id: "ME" }, { type: "Client", id: "ME" }],
    }),
    requestAffiliatePayout: builder.mutation<AffiliatePayoutRequestItem, { amount: number; currency?: string; payoutDetails?: any }>({
      query: (body) => ({
        url: "/affiliate/me/payout-requests",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<AffiliatePayoutRequestItem>) => response.data,
      invalidatesTags: [{ type: "Affiliate", id: "ME" }, { type: "Affiliate", id: "ADMIN" }],
    }),
    getAdminAffiliateDashboard: builder.query<AdminAffiliateDashboardResponse, void>({
      query: () => "/affiliate/admin/dashboard",
      transformResponse: (response: ApiResponse<AdminAffiliateDashboardResponse>) => response.data,
      providesTags: [{ type: "Affiliate", id: "ADMIN" }],
    }),
    getAdminClientAffiliate: builder.query<AdminClientAffiliateResponse, string>({
      query: (clientId) => `/affiliate/admin/clients/${clientId}`,
      transformResponse: (response: ApiResponse<AdminClientAffiliateResponse>) => response.data,
      providesTags: (result, error, clientId) => [{ type: "Affiliate", id: `ADMIN-CLIENT-${clientId}` }],
    }),
    enrollClientAffiliateAdmin: builder.mutation<{ profile: AffiliateProfile; referralLink: string }, string>({
      query: (clientId) => ({
        url: `/affiliate/admin/clients/${clientId}/enroll`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ profile: AffiliateProfile; referralLink: string }>) => response.data,
      invalidatesTags: (result, error, clientId) => [
        { type: "Affiliate", id: "ADMIN" },
        { type: "Affiliate", id: `ADMIN-CLIENT-${clientId}` },
      ],
    }),
    updateAffiliateDefaultSettings: builder.mutation<
      AffiliateSettings,
      { defaultCommissionRate: number; defaultReferralDiscountRate: number; defaultPayoutThreshold: number }
    >({
      query: (body) => ({
        url: "/affiliate/admin/settings",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<AffiliateSettings>) => response.data,
      invalidatesTags: [{ type: "Affiliate", id: "ADMIN" }],
    }),
    updateAffiliateClientSettings: builder.mutation<
      AffiliateProfile,
      { clientId: string; commissionRate: number; referralDiscountRate: number; payoutThreshold: number }
    >({
      query: ({ clientId, ...body }) => ({
        url: `/affiliate/admin/clients/${clientId}/settings`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<AffiliateProfile>) => response.data,
      invalidatesTags: (result, error, { clientId }) => [
        { type: "Affiliate", id: "ADMIN" },
        { type: "Affiliate", id: "ME" },
        { type: "Affiliate", id: `ADMIN-CLIENT-${clientId}` },
      ],
    }),
    updateAffiliateClientStatus: builder.mutation<AffiliateProfile, { clientId: string; status: "active" | "paused" }>({
      query: ({ clientId, ...body }) => ({
        url: `/affiliate/admin/clients/${clientId}/status`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<AffiliateProfile>) => response.data,
      invalidatesTags: (result, error, { clientId }) => [
        { type: "Affiliate", id: "ADMIN" },
        { type: "Affiliate", id: "ME" },
        { type: "Affiliate", id: `ADMIN-CLIENT-${clientId}` },
      ],
    }),
    updateMyAffiliateReferralCode: builder.mutation<
      { profile: AffiliateProfile; referralLink: string },
      { referralCode: string }
    >({
      query: (body) => ({
        url: "/affiliate/me/referral-code",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<{ profile: AffiliateProfile; referralLink: string }>) => response.data,
      invalidatesTags: [{ type: "Affiliate", id: "ME" }, { type: "Affiliate", id: "ADMIN" }],
    }),
    regenerateMyAffiliateReferralCode: builder.mutation<{ profile: AffiliateProfile; referralLink: string }, void>({
      query: () => ({
        url: "/affiliate/me/referral-code/regenerate",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ profile: AffiliateProfile; referralLink: string }>) => response.data,
      invalidatesTags: [{ type: "Affiliate", id: "ME" }, { type: "Affiliate", id: "ADMIN" }],
    }),
    reviewAffiliatePayout: builder.mutation<AffiliatePayoutRequestItem, { id: string; action: "approve" | "reject" | "mark_paid"; notes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/affiliate/admin/payout-requests/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<AffiliatePayoutRequestItem>) => response.data,
      invalidatesTags: [{ type: "Affiliate", id: "ADMIN" }, { type: "Affiliate", id: "ME" }],
    }),
    updateAffiliateClientReferralCode: builder.mutation<
      { profile: AffiliateProfile; referralLink: string },
      { clientId: string; referralCode: string }
    >({
      query: ({ clientId, referralCode }) => ({
        url: `/affiliate/admin/clients/${clientId}/referral-code`,
        method: "PATCH",
        body: { referralCode },
      }),
      transformResponse: (response: ApiResponse<{ profile: AffiliateProfile; referralLink: string }>) => response.data,
      invalidatesTags: (result, error, { clientId }) => [
        { type: "Affiliate", id: "ADMIN" },
        { type: "Affiliate", id: `ADMIN-CLIENT-${clientId}` },
      ],
    }),
    regenerateAffiliateClientReferralCode: builder.mutation<
      { profile: AffiliateProfile; referralLink: string },
      string
    >({
      query: (clientId) => ({
        url: `/affiliate/admin/clients/${clientId}/referral-code/regenerate`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ profile: AffiliateProfile; referralLink: string }>) => response.data,
      invalidatesTags: (result, error, clientId) => [
        { type: "Affiliate", id: "ADMIN" },
        { type: "Affiliate", id: `ADMIN-CLIENT-${clientId}` },
      ],
    }),
  }),
});

export const {
  useGetMyAffiliateDashboardQuery,
  useEnrollAffiliateMutation,
  useRedeemAffiliateCreditMutation,
  useRequestAffiliatePayoutMutation,
  useGetAdminAffiliateDashboardQuery,
  useGetAdminClientAffiliateQuery,
  useEnrollClientAffiliateAdminMutation,
  useUpdateAffiliateDefaultSettingsMutation,
  useUpdateAffiliateClientSettingsMutation,
  useUpdateAffiliateClientStatusMutation,
  useUpdateMyAffiliateReferralCodeMutation,
  useRegenerateMyAffiliateReferralCodeMutation,
  useReviewAffiliatePayoutMutation,
  useUpdateAffiliateClientReferralCodeMutation,
  useRegenerateAffiliateClientReferralCodeMutation,
} = affiliateApi;
