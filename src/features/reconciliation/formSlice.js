import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const formAPI = createApi({
  reducerPath: "formAPI",
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  tagTypes: ["FormDropdowns"],
  endpoints: (builder) => ({

    // ── GET: Dropdown data (projects, accounts, capitalMovements) ──
    getFormDropdowns: builder.query({
      query: () => "/api/Reconcilition/form?action=dropdown-data",
      providesTags: ["FormDropdowns"],
    }),

    // ── POST: Add Payment ──
    addPayment: builder.mutation({
      query: (data) => ({
        url: "/api/Reconcilition/form",
        method: "POST",
        body: {
          action: "add-payment",
          ...data,
        },
      }),
    }),

    // ── POST: Bank Transfer ──
    addBankTransfer: builder.mutation({
      query: (data) => ({
        url: "/api/Reconcilition/form",
        method: "POST",
        body: {
          action: "Bank_Transfer_form",
          ...data,
        },
      }),
    }),

    // ── POST: Capital Movement ──
    addCapitalMovement: builder.mutation({
      query: (data) => ({
        url: "/api/Reconcilition/form",
        method: "POST",
        body: {
          action: "Captial-A/C",
          ...data,
        },
      }),
    }),

  }),
});

export const {
  useGetFormDropdownsQuery,
  useAddPaymentMutation,
  useAddBankTransferMutation,
  useAddCapitalMovementMutation,
} = formAPI;