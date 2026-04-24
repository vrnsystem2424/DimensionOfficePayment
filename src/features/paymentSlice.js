
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Option 1: Sabse simple (sabse zyada log yahi use karte hain)
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
// ↑↑ fallback "" empty string dena safe hai

// Option 2: Agar undefined hone pe error dena chahte ho (strict mode)
// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
// if (!baseUrl) {
//   throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in environment variables!");
// }

export const dimPaymentApi = createApi({
  reducerPath: "dimPaymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl,          // ← yaha use karo
  }),
  tagTypes: ["PendingDimPayments"],
  endpoints: (builder) => ({
    getPendingDimPayments: builder.query({
      query: () => "/api/OfficeExpenses/payment",
      providesTags: ["PendingDimPayments"],
    }),
    updateDimPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/api/OfficeExpenses/payment",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["PendingDimPayments"],
    }),
  }),
});

export const {
  useGetPendingDimPaymentsQuery,
  useUpdateDimPaymentMutation,
} = dimPaymentApi;