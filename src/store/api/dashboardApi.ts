import { api } from "./baseApi";

export interface DailyActionsStats {
  invoices: { generated: number };
  lateFees: { added: number; message?: string };
  creditCardCharges: { captured: number; declined: number };
  invoiceReminders: { sent: number };
  currencyExchangeRates: { status: "completed" | "pending" | "not_run"; message?: string };
  cancellationRequests: { processed: number; failed: number; message?: string };
  overdueSuspensions: { suspended: number; failed: number };
  domainTransferSync: { transfersChecked: number };
  domainStatusSync: { domainsSynced: number };
  inactiveTickets: { closed: number };
  databaseBackup: { status: "completed" | "disabled" | "failed"; message?: string };
  serverUsageStats: { status: "completed" | "pending" | "failed"; message?: string };
}

export interface DailyActionsParams {
  dateFrom?: string;
  dateTo?: string;
}

export type DailyActionDetailType = "invoices" | "creditCardCharges" | "inactiveTickets";

export interface DailyActionDetailItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  amount?: number;
  currency?: string;
  date?: string;
  href?: string;
}

export interface DailyActionDetailsResponse {
  type: DailyActionDetailType;
  title: string;
  items: DailyActionDetailItem[];
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDailyActions: builder.query<DailyActionsStats, DailyActionsParams | void>({
      query: (params) => ({
        url: "/dashboard/daily-actions",
        params: params ?? {},
      }),
      transformResponse: (response: { data?: DailyActionsStats }) =>
        response?.data ?? (response as unknown as DailyActionsStats),
      providesTags: ["Invoice", "Ticket"],
    }),
    getDailyActionDetails: builder.query<
      DailyActionDetailsResponse,
      DailyActionsParams & { type: DailyActionDetailType }
    >({
      query: ({ type, ...params }) => ({
        url: "/dashboard/daily-actions/details",
        params: { type, ...params },
      }),
      transformResponse: (response: { data?: DailyActionDetailsResponse }) =>
        response?.data ?? (response as unknown as DailyActionDetailsResponse),
      providesTags: ["Invoice", "Ticket"],
    }),
  }),
});

export const { useGetDailyActionsQuery, useLazyGetDailyActionDetailsQuery } = dashboardApi;
