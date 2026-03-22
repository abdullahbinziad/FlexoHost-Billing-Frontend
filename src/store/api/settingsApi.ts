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
    smtpUseCustom: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPasswordIsSet: boolean;
    smtpSecure: boolean;
    smtpRequireTls: boolean;
    smtpTlsRejectUnauthorized: boolean;
    emailFrom: string;
}

export type BillingSettingsPatch = Partial<Omit<BillingSettings, "smtpPasswordIsSet">> & {
    smtpPassword?: string | null;
};

/** Default form state before API load; used by billing settings and SMTP pages. */
/** Strip SMTP fields so the billing-only page does not overwrite SMTP when saving. */
export function billingFormWithoutSmtpFields(form: BillingSettings): BillingSettingsPatch {
    const {
        smtpPasswordIsSet: _a,
        smtpUseCustom: _b,
        smtpHost: _c,
        smtpPort: _d,
        smtpUser: _e,
        smtpSecure: _f,
        smtpRequireTls: _g,
        smtpTlsRejectUnauthorized: _h,
        emailFrom: _i,
        ...billingOnly
    } = form;
    void _a;
    void _b;
    void _c;
    void _d;
    void _e;
    void _f;
    void _g;
    void _h;
    void _i;
    return billingOnly;
}

export const DEFAULT_BILLING_SETTINGS: BillingSettings = {
    renewalLeadDays: 7,
    daysBeforeSuspend: 5,
    daysBeforeTermination: 30,
    invoiceDueDays: 7,
    overdueExtraChargeDays: 0,
    overdueExtraChargeAmount: 0,
    overdueExtraChargeType: "fixed",
    reminderPreDays: 7,
    reminderOverdue1Days: 3,
    reminderOverdue2Days: 7,
    reminderOverdue3Days: 14,
    preReminderDays: [30, 14, 7, 3, 1],
    overdueReminderDays: [1, 3, 7, 14, 30],
    suspendWarningDays: [3, 1],
    terminationWarningDays: [7, 3, 1],
    domainExpiryReminderDays: [90, 60, 30, 14, 7],
    reminderDueTodayEnabled: true,
    smtpUseCustom: false,
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPasswordIsSet: false,
    smtpSecure: false,
    smtpRequireTls: true,
    smtpTlsRejectUnauthorized: true,
    emailFrom: "",
};

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
        updateBillingSettings: builder.mutation<SettingsResponse, BillingSettingsPatch>({
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
