import { api } from "./baseApi";

export const clientApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Client-specific endpoints will be added here
    // Example:
    // getClientServices: builder.query<Service[], void>({
    //   query: () => "/services",
    //   providesTags: ["Service"],
    // }),
  }),
});

export const {} = clientApi;
