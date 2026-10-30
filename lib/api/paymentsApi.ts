import { baseApi } from "./baseApi";

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPlans: build.query({
      query: () => "/payments/plans",
    }),

    createCheckout: build.mutation<
      { paymentId: string; priceId: string; customData: Record<string, string> },
      { productId: string; plan: "starter" | "pro" }
    >({
      query: (body) => ({
        url: "/payments/checkout",
        method: "POST",
        body,
      }),
    }),

    getPaymentStatus: build.query<{ status: "pending" | "completed" | "failed" | "refunded" }, string>({
      query: (paymentId) => `/payments/${paymentId}/status`,
    }),
  }),
});

export const { useGetPlansQuery, useCreateCheckoutMutation, useLazyGetPaymentStatusQuery } = paymentsApi;
