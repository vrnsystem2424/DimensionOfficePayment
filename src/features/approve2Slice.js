import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";  

export const approve2Api = createApi({
  reducerPath: "approve2Api",
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  tagTypes: ["FinalApprovals"],     // different tag name so it doesn't interfere with approve1
  endpoints: (builder) => ({
    // GET — list of expenses ready for final approval / payment
    getFinalApprovals: builder.query({
      query: () => "/api/OfficeExpenses/approvel2",
      providesTags: ["FinalApprovals"],
    }),

    // POST — final approval / payment update
    updateFinalApproval: builder.mutation({
      query: (approvalData) => ({
        url: "/api/OfficeExpenses/approvel2",
        method: "POST",
        body: approvalData,         // { uid, STATUS_3, PAYMENT_MODE_3, REMARK_3 }
      }),
      invalidatesTags: ["FinalApprovals"],  // auto refresh list after update
    }),
  }),
});

export const {
  useGetFinalApprovalsQuery,
  useUpdateFinalApprovalMutation,
} = approve2Api;




