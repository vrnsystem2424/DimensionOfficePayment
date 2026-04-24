

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";  

export const approve1Api = createApi({
  reducerPath: "approve1Api",
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  tagTypes: ["PendingApprovals"],   // helps with auto-refetch after update
  endpoints: (builder) => ({
    // GET pending items for approval
    getPendingApprovals: builder.query({
      query: () => "/api/OfficeExpenses/approvel1",
      providesTags: ["PendingApprovals"],
    }),

    // POST - approve / update one record
    updateApproval: builder.mutation({
      query: (approvalData) => ({
        url: "/api/OfficeExpenses/approvel1",
        method: "POST",
        body: approvalData,           // { uid, STATUS_2, REVISED_AMOUNT_3, APPROVAL_DOER_2, REMARK_2 }
      }),
      invalidatesTags: ["PendingApprovals"],  // refetch list automatically
    }),
  }),
});

export const {
  useGetPendingApprovalsQuery,
  useUpdateApprovalMutation,
} = approve1Api;