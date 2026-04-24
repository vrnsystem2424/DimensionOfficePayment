// app/redux/api/expensesForm.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const expensesForm = createApi({
  reducerPath: "expensesForm",
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  tagTypes: ["FormData", "PaymentSubmission"],
  endpoints: (builder) => ({
    // Get all data at once
    getAllFormData: builder.query({
      query: () => "api/OfficeExpenses/form?action=all-data",
      transformResponse: (response) => {
        if (response?.type === 'all-data') {
          const subheadsList = [];
          const itemsMap = {};
          const formRaisedMap = {};
          
          response.data.forEach(subheadData => {
            subheadsList.push(subheadData.subhead);
            itemsMap[subheadData.subhead] = subheadData.items;
            formRaisedMap[subheadData.subhead] = subheadData.formRaised;
          });
          
          return {
            subheads: subheadsList,
            items: itemsMap,
            formRaised: formRaisedMap,
            rawData: response.data
          };
        }
        return {
          subheads: [],
          items: {},
          formRaised: {},
          rawData: []
        };
      },
      providesTags: ["FormData"],
    }),

    // Submit payment
    submitPayment: builder.mutation({
      query: (paymentData) => ({
        url: "api/OfficeExpenses/form",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["PaymentSubmission"],
    }),
  }),
});

export const {
  useGetAllFormDataQuery,
  useSubmitPaymentMutation,
} = expensesForm;