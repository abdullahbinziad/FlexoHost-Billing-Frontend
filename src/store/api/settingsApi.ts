import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";

export interface BillingSettings {
    defaultStaffRoleId?: string | null;
    renewalLeadDays: number;
    daysBeforeSuspend: number;
    daysBeforeTermination: number;
    invoiceDueDays: number;
    overdueExtraChargeDays: number;
    overdueExtraChargeAmount: number;
    overdueExtraChargeType: "fixed" | "percent";
    reminderPreDays: number;
    reminderOverdue1Days: number;
    reminderOverdue2Days: number;
    reminderOverdue3Days: number;
    preReminderDays: number[];
    overdueReminderDays: number[];
    suspendWarningDays: number[];
    terminationWarningDays: number[];
    domainExpiryReminderDays: number[];
    reminderDueTodayEnabled: boolean;
}

export interface SettingsResponse {
    billing: BillingSettings;
}

export const settingsApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getSettings: builder.query<SettingsResponse, void>({
            query: () => "/admin/settings",
            transformResponse: (response: ApiResponse<SettingsResponse>) => response.data ?? { billing: {} as BillingSettings },
            providesTags: [{ type: "Settings", id: "LIST" }],
        }),
        updateBillingSettings: builder.mutation<SettingsResponse, Partial<BillingSettings>>({
            query: (body) => ({
                url: "/admin/settings/billing",
                method: "PATCH",
                body,
            }),
            transformResponse: (response: ApiResponse<SettingsResponse>) => response.data ?? { billing: {} as BillingSettings },
            invalidatesTags: [{ type: "Settings", id: "LIST" }],
        }),
    }),
});

export const { useGetSettingsQuery, useUpdateBillingSettingsMutation } = settingsApi;
