import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";
import { DEFAULT_CURRENCIES, type Currency } from "@/types/currency";

export interface SupportedCurrenciesResponse {
  currencies: Array<Currency & { enabled?: boolean; isDefault?: boolean; isBaseReporting?: boolean }>;
  defaultCurrency: string;
  baseReportingCurrency: string;
}

const DEFAULT_RESPONSE: SupportedCurrenciesResponse = {
  currencies: DEFAULT_CURRENCIES.map((currency) => ({ ...currency, enabled: true })),
  defaultCurrency: "BDT",
  baseReportingCurrency: "USD",
};

export const currencyApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSupportedCurrencies: builder.query<SupportedCurrenciesResponse, void>({
      query: () => "/currencies/enabled",
      transformResponse: (response: ApiResponse<SupportedCurrenciesResponse>) =>
        response.data ?? DEFAULT_RESPONSE,
      providesTags: [{ type: "Currency", id: "SUPPORTED" }],
    }),
  }),
});

export const { useGetSupportedCurrenciesQuery } = currencyApi;
