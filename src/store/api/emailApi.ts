import { api } from "./baseApi";
import { ApiResponse } from "@/types/api";

export interface SendBulkEmailRequest {
  clientIds: string[];
  subject: string;
  message: string;
  html?: string;
}

export interface BulkEmailResultItem {
  clientId: string;
  email: string | null;
  success: boolean;
  error?: string;
}

export interface SendBulkEmailResponse {
  sent: number;
  failed: number;
  total: number;
  results: BulkEmailResultItem[];
}

export interface EmailLogEntry {
  _id: string;
  clientId?: string | { _id: string; firstName?: string; lastName?: string; contactEmail?: string };
  serviceId?: string | { _id: string; serviceNumber?: string; type?: string; status?: string };
  invoiceId?: string | { _id: string; invoiceNumber?: string; status?: string; total?: number; balanceDue?: number };
  domainId?: string;
  orderId?: string;
  ticketId?: string;
  sentBy?: string | { _id: string; email?: string };
  actorType: "system" | "user";
  source: "manual" | "system" | "cron" | "webhook";
  status: "queued" | "sent" | "failed";
  to: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  templateKey?: string;
  emailType?: string;
  bodyPreview?: string;
  providerMessageId?: string;
  error?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface GetEmailLogsParams {
  page?: number;
  limit?: number;
  clientId?: string;
  serviceId?: string;
  invoiceId?: string;
  domainId?: string;
  orderId?: string;
  ticketId?: string;
  status?: "queued" | "sent" | "failed";
  source?: "manual" | "system" | "cron" | "webhook";
  templateKey?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetEmailLogsResponse {
  results: EmailLogEntry[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface EmailTemplateOverride {
  templateKey: string;
  enabled: boolean;
  subject?: string;
  previewText?: string;
  html?: string;
  text?: string;
  updatedAt?: string;
}

export interface ManagedEmailTemplate {
  key: string;
  category: string;
  defaultSubjectPreview?: string;
  defaultPreviewText?: string;
  defaultHtml?: string;
  defaultText?: string;
  availableVariables?: string[];
  override: EmailTemplateOverride | null;
}

export interface EmailPreviewResponse {
  subject: string;
  previewText: string;
  html: string;
  text: string;
}

export const emailApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getEmailLogs: builder.query<GetEmailLogsResponse, GetEmailLogsParams | void>({
            query: (params) => ({
                url: "/email/logs",
                params: params || {},
            }),
            transformResponse: (response: ApiResponse<GetEmailLogsResponse>) =>
                response.data ?? { results: [], page: 1, limit: 20, totalPages: 0, totalResults: 0 },
            providesTags: ["EmailLog"],
        }),
        sendBulkEmail: builder.mutation<SendBulkEmailResponse, SendBulkEmailRequest>({
            query: (body) => ({
                url: "/email/send-bulk",
                method: "POST",
                body,
            }),
            transformResponse: (response: ApiResponse<SendBulkEmailResponse>) => response.data,
            invalidatesTags: ["EmailLog", "ActivityLog"],
        }),
        getManagedEmailTemplates: builder.query<{ templates: ManagedEmailTemplate[] }, void>({
            query: () => "/email/templates/manage",
            transformResponse: (response: ApiResponse<{ templates: ManagedEmailTemplate[] }>) =>
                response.data ?? { templates: [] },
            providesTags: ["Settings"],
        }),
        previewManagedEmailTemplate: builder.mutation<EmailPreviewResponse, { templateKey: string; props?: Record<string, unknown>; draft?: Partial<EmailTemplateOverride> }>({
            query: ({ templateKey, props, draft }) => ({
                url: `/email/templates/${templateKey}/preview-saved`,
                method: "POST",
                body: { props: props || {}, draft },
            }),
            transformResponse: (response: ApiResponse<EmailPreviewResponse>) => response.data,
        }),
        saveEmailTemplateOverride: builder.mutation<
          { override: EmailTemplateOverride },
          { templateKey: string; data: Partial<EmailTemplateOverride> }
        >({
            query: ({ templateKey, data }) => ({
                url: `/email/templates/${templateKey}/override`,
                method: "PATCH",
                body: data,
            }),
            transformResponse: (response: ApiResponse<{ override: EmailTemplateOverride }>) => response.data,
            invalidatesTags: ["Settings"],
        }),
        resetEmailTemplateOverride: builder.mutation<void, string>({
            query: (templateKey) => ({
                url: `/email/templates/${templateKey}/override`,
                method: "DELETE",
            }),
            invalidatesTags: ["Settings"],
        }),
    }),
});

export const {
  useGetEmailLogsQuery,
  useSendBulkEmailMutation,
  useGetManagedEmailTemplatesQuery,
  usePreviewManagedEmailTemplateMutation,
  useSaveEmailTemplateOverrideMutation,
  useResetEmailTemplateOverrideMutation,
} = emailApi;
