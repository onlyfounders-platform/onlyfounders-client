import { baseApi } from "./baseApi";

export interface PlanInfo {
  id: string; name: string; price: number; interval: string; description: string; features: string[]; active: boolean; highlight: boolean;
}

export interface PlatformInfo {
  siteName: string;
  registrationOpen: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  postsEnabled: boolean;
  messagesEnabled: boolean;
  maxPostLength: number;
  announcement: { enabled: boolean; text: string; link: string; tone: "info" | "success" | "warning" } | null;
  plans: PlanInfo[];
}

export type ReportReason = "spam" | "harassment" | "hate" | "misinformation" | "impersonation" | "nsfw" | "scam" | "other";

export const platformApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV !== "production",
  endpoints: (build) => ({
    getPlatform: build.query<PlatformInfo, void>({
      query: () => "/platform",
      providesTags: ["Platform"],
    }),
    createReport: build.mutation<{ message: string }, { targetType: "post" | "user" | "product" | "comment"; targetId: string; reason: ReportReason; details?: string }>({
      query: (body) => ({ url: "/reports", method: "POST", body }),
    }),
    logoutAll: build.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/logout-all", method: "POST" }),
    }),
    getMyPayments: build.query<{ payments: any[] }, void>({
      query: () => "/payments/me",
    }),
  }),
});

export const { useGetPlatformQuery, useCreateReportMutation, useLogoutAllMutation, useGetMyPaymentsQuery } = platformApi;
