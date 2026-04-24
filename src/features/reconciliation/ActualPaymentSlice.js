import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const actualPaymentApi = createApi({
  reducerPath: "actualPaymentApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["ActualPayments"],

  endpoints: (builder) => ({

    // ── GET: Pending approval payments ──
    getPendingPayments: builder.query({
      query: () => "/api/Reconcilition/ActualPaymentIN",
      providesTags: ["ActualPayments"],
    }),

    // ── POST: Approve / update a payment ──
    updatePayment: builder.mutation({
      query: (data) => ({
        url: "/api/Reconcilition/ActualPaymentIN",
        method: "POST",
        body: data,
        // data mein yeh fields honi chahiye:
        // { uid, STATUS_2, BANK_CLOSING_BALANCE_2, REMARK_2 }
      }),
      invalidatesTags: ["ActualPayments"],
    }),

  }),
});

export const {
  useGetPendingPaymentsQuery,
  useUpdatePaymentMutation,
} = actualPaymentApi;