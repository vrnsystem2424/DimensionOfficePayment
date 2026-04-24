// // reconciliationAPI.js
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";  

// export const reconciliationAPI = createApi({
//   reducerPath: "reconciliationAPI",
//   baseQuery: fetchBaseQuery({
//     baseUrl,
//   }),
//   tagTypes: ["PendingApprovals"],   
//   endpoints: (builder) => ({
//     getPendingApprovals: builder.query({
//       query: () => "/api/Reconcilition/reconciliation",
//       // Response ko transform karo - apne API ke hisab se change karo
//       transformResponse: (response) => {
//         console.log("Raw API Response:", response);
//         // Agar response object hai to array nikalo
//         return response?.data || response?.result || response?.items || response || [];
//       },
//       providesTags: ["PendingApprovals"],
//     }),

//     updateApproval: builder.mutation({
//       query: (approvalData) => ({
//         url: "/api/Reconcilition/reconciliation",
//         method: "POST",
//         body: approvalData,           
//       }),
//       invalidatesTags: ["PendingApprovals"],  
//     }),
//   }),
// });

// export const {
//   useGetPendingApprovalsQuery,
//   useUpdateApprovalMutation,
// } = reconciliationAPI;


// src/features/reconciliation/reconciliationAPI.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";  

export const reconciliationAPI = createApi({
  reducerPath: "reconciliationAPI",
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  tagTypes: ["PendingApprovals", "BankBalance"],   
  endpoints: (builder) => ({
    
    // ✅ Endpoint 1 - Get Pending Approvals
    getPendingApprovals: builder.query({
      query: () => "/api/Reconcilition/reconciliation",
      transformResponse: (response) => {
        console.log("Raw API Response:", response);
        return response?.data || response?.result || response?.items || response || [];
      },
      providesTags: ["PendingApprovals"],
    }),

    // ✅ Endpoint 2 - Update Approval
    updateApproval: builder.mutation({
      query: (approvalData) => ({
        url: "/api/Reconcilition/reconciliation",
        method: "POST",
        body: approvalData,           
      }),
      invalidatesTags: ["PendingApprovals"],  
    }),

    // ✅ Endpoint 3 - Get Bank Balance (NEW)
    getBankBalance: builder.query({
      query: (bankName) => `/api/Reconcilition/reconciliation/bankbalance?bank=${encodeURIComponent(bankName)}`,
      transformResponse: (response) => {
        console.log("Bank Balance Response:", response);
        return response;
      },
      providesTags: (result, error, bankName) => [
        { type: "BankBalance", id: bankName }
      ],
    }),

  }),
});

// ✅ Export all hooks
export const {
  useGetPendingApprovalsQuery,
  useUpdateApprovalMutation,
  useGetBankBalanceQuery,        // Auto fetch when bank changes
  useLazyGetBankBalanceQuery,    // Manual fetch (for button click)
} = reconciliationAPI;