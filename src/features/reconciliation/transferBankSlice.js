// transferBankAPI.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const transferBankAPI = createApi({
  reducerPath: "transferBankAPI",
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  tagTypes: ["TransferBank"],
  endpoints: (builder) => ({
    // GET - Fetch all pending transfers
    getTransferBankData: builder.query({
      query: () => "/api/Reconcilition/transferbank",
      transformResponse: (response) => {
        console.log("Raw Transfer Bank API Response:", response);
        return response?.data || response?.result || response?.items || response || [];
      },
      providesTags: ["TransferBank"],
    }),

    // POST - Update transfer status
    updateTransferBank: builder.mutation({
      query: (updateData) => ({
        url: "/api/Reconcilition/transferbank",
        method: "POST",
        body: updateData,
      }),
      invalidatesTags: ["TransferBank"],
    }),
  }),
});

export const {
  useGetTransferBankDataQuery,
  useUpdateTransferBankMutation,
} = transferBankAPI;