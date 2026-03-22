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

export interface TestSmtpResponse {
    to: string;
    messageId?: string;
    smtpHost: string;
    smtpPort: number;
    smtpSource: "env" | "dashboard";
}

export const emailApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        sendBulkEmail: builder.mutation<SendBulkEmailResponse, SendBulkEmailRequest>({
            query: (body) => ({
                url: "/email/send-bulk",
                method: "POST",
                body,
            }),
            transformResponse: (response: ApiResponse<SendBulkEmailResponse>) => response.data,
        }),
        testSmtp: builder.mutation<TestSmtpResponse, { to: string }>({
            query: (body) => ({
                url: "/email/test",
                method: "POST",
                body,
            }),
            transformResponse: (response: ApiResponse<TestSmtpResponse>) => response.data as TestSmtpResponse,
        }),
    }),
});

export const { useSendBulkEmailMutation, useTestSmtpMutation } = emailApi;
