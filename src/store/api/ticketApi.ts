import { api } from "./baseApi";

export type TicketStatus =
  | "open"
  | "answered"
  | "customer_reply"
  | "on_hold"
  | "in_progress"
  | "closed"
  | "resolved";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketDepartment = "technical" | "billing" | "sales" | "support";

export interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  clientId: string;
  userId: string;
  serviceId?: string;
  invoiceId?: string;
  lastRepliedAt?: string;
  lastReplierType?: "client" | "staff";
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  _id: string;
  ticketId: string;
  authorType: "client" | "staff" | "system";
  authorId: string;
  message: string;
  messageHtml?: string;
  attachments?: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  }[];
  internal: boolean;
  createdAt: string;
}

export interface TicketListResponse {
  results: Ticket[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface TicketClientInfo {
  firstName: string;
  lastName: string;
  contactEmail?: string;
  phoneNumber?: string;
  address?: string;
}

export interface TicketDetailResponse {
  ticket: Ticket;
  messages: TicketMessage[];
  /** Populated for admin/staff only */
  client?: TicketClientInfo | null;
}

export const ticketApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<
      TicketListResponse,
      { page?: number; limit?: number; status?: string; priority?: string; department?: string; clientId?: string }
    >({
      query: (params) => ({
        url: "/tickets",
        params,
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["Ticket"],
    }),
    getTicketById: builder.query<TicketDetailResponse, string>({
      query: (id) => `/tickets/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Ticket" as const, id }],
    }),
    createTicket: builder.mutation<
      Ticket,
      {
        subject: string;
        department: TicketDepartment;
        priority: TicketPriority;
        message: string;
        messageHtml?: string;
        attachments?: File[];
        serviceId?: string;
        invoiceId?: string;
      }
    >({
      query: ({ attachments, ...rest }) => {
        const formData = new FormData();
        Object.entries(rest).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        if (attachments && attachments.length > 0) {
          attachments.forEach((file) => formData.append("attachments", file));
        }
        return {
          url: "/tickets",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["Ticket"],
    }),
    addTicketReply: builder.mutation<
      void,
      { id: string; message: string; messageHtml?: string; internal?: boolean; attachments?: File[] }
    >({
      query: ({ id, message, messageHtml, internal, attachments }) => {
        const formData = new FormData();
        formData.append("message", message);
        if (messageHtml) formData.append("messageHtml", messageHtml);
        if (typeof internal !== "undefined") {
          formData.append("internal", String(internal));
        }
        if (attachments && attachments.length > 0) {
          attachments.forEach((file) => formData.append("attachments", file));
        }
        return {
          url: `/tickets/${id}/replies`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: "Ticket" as const, id }, "Ticket"],
    }),
    updateTicketStatus: builder.mutation<
      Ticket,
      { id: string; status: TicketStatus }
    >({
      query: ({ id, status }) => ({
        url: `/tickets/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: "Ticket" as const, id }, "Ticket"],
    }),
    markTicketResolved: builder.mutation<Ticket, string>({
      query: (id) => ({
        url: `/tickets/${id}/resolve`,
        method: "PATCH",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, id) => [{ type: "Ticket" as const, id }, "Ticket"],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useAddTicketReplyMutation,
  useUpdateTicketStatusMutation,
  useMarkTicketResolvedMutation,
} = ticketApi;

