import { api } from "./baseApi";

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Empty for now, server endpoints moved to serverApi.ts
    // Future general admin endpoints can go here
  }),
});

export const { } = adminApi;
