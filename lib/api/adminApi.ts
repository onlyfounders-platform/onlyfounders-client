import { baseApi } from "./baseApi";

export interface AdminStats {
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  totalUsers: number;
  totalUpvotes: number;
  totalComments: number;
  users: { total: number; new7d: number; new30d: number; active1d: number; active7d: number; suspended: number; deactivated: number; verified: number; admins: number };
  products: { total: number; approved: number; pending: number; draft: number; rejected: number; featured: number; upvotes: number; comments: number };
  content: { posts: number; posts24h: number; replies: number; likes: number; messages: number; messages24h: number; conversations: number };
  revenue: { total: number; last30d: number; completed: number; pending: number; refunded: number };
  subscriptions: { free: number; starter: number; pro: number };
  email: { queued: number; sent24h: number; failed: number; skipped24h: number };
  moderation: { openReports: number };
}

export interface SeriesPoint { date: string; value: number }
export interface AdminAnalytics {
  series: Record<"signups" | "posts" | "products" | "revenue" | "messages" | "emails" | "activeFounders", SeriesPoint[]>;
  topProducts: { _id: string; name: string; slug: string; logo?: string; upvoteCount: number; commentCount: number }[];
  topFounders: { _id: string; name: string; username: string; avatar?: string; reputation: number; followers: number }[];
  categories: { category: string; count: number }[];
}

export interface Paged<T> { total: number; page: number; limit: number; pages: number; items?: T[] }

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  logo?: string;
  tags: string[];
  category?: string;
  status: "pending" | "approved" | "rejected" | "draft";
  plan?: "free" | "starter" | "pro";
  makers?: { _id: string; name: string; username: string; avatar?: string }[];
  createdAt?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  linkType?: string;
  upvoteCount?: number;
  votes?: number;
  commentCount?: number;
  comments?: number;
}

export interface AdminProductsResponse {
  products: AdminProduct[];
  total: number;
  pages: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "user";
  reputation?: number;
  createdAt?: string;
  avatar?: string;
  bio?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  followers?: string[];
  following?: string[];
  badges?: string[];
  unlockedAchievements?: { key: string; unlockedAt: string }[];
  launchStreak?: number;
  longestStreak?: number;
  isEmailVerified?: boolean;
  newsletterSubscribed?: boolean;
  openTo?: string[];
  googleId?: string;
  status?: "active" | "suspended" | "deactivated";
  suspendedReason?: string;
  suspendedUntil?: string;
  isVerified?: boolean;
  lastSeenAt?: string;
  lastLoginAt?: string;
  location?: string;
  subscription?: { plan: "free" | "starter" | "pro"; status: string; startedAt?: string; expiresAt?: string; source?: string; note?: string };
}

export interface AdminUserDetail {
  user: AdminUser & { followers: any[]; following: any[]; blocked: any[]; muted: any[] };
  stats: {
    posts: number; replies: number; likesGiven: number; upvotesGiven: number; messagesSent: number; conversations: number;
    products: number; followers: number; following: number; reportsAgainst: number; reportsFiled: number; totalSpent: number;
    activity: Record<string, number>;
  };
  products: any[]; recentPosts: any[]; payments: any[]; emails: any[]; reportsAgainst: any[]; recentNotifications: any[]; adminLogs: any[];
}

export interface PlatformSettings {
  siteName: string; supportEmail: string; registrationOpen: boolean; maintenanceMode: boolean; maintenanceMessage: string;
  emailNotificationsEnabled: boolean; productLaunchEmails: boolean; messageEmailDelayMinutes: number; loginAlertEmails: boolean;
  postsEnabled: boolean; messagesEnabled: boolean; launchesRequireApproval: boolean; maxPostLength: number;
  announcement: { enabled: boolean; text: string; link: string; tone: "info" | "success" | "warning" };
  plans: { id: string; name: string; price: number; interval: string; description: string; features: string[]; active: boolean; highlight: boolean }[];
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  pages: number;
}

export interface SeedPreviewUser {
  name: string;
  username: string;
  email: string;
  bio?: string;
  twitter?: string;
  website?: string;
  avatar?: string;
  reputation?: number;
  badges?: string[];
  launchStreak?: number;
  isEmailVerified?: boolean;
  role?: string;
}

export interface SeedPreviewProduct {
  name: string;
  tagline: string;
  description: string;
  website: string;
  logo?: string;
  category: string;
  tags?: string[];
  pricing?: string;
  upvoteCount?: number;
  commentCount?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  linkType?: string;
  hasBadge?: boolean;
  status?: string;
  maker: { name: string; username: string; avatar?: string } | null;
}

const qs = (params: Record<string, unknown>) =>
  Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");

type ListArgs = Record<string, string | number | boolean | undefined>;

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV !== "production",
  endpoints: (build) => ({
    getAdminStats: build.query<AdminStats, void>({
      query: () => "/admin/stats",
      providesTags: ["AdminProduct", "AdminUser", "AdminReport", "AdminEmail", "AdminPayment"],
    }),
    getAdminAnalytics: build.query<AdminAnalytics, number | void>({
      query: (days = 30) => `/admin/analytics?days=${days}`,
    }),

    getAdminProducts: build.query<AdminProductsResponse, ListArgs>({
      query: (args = {}) => `/admin/products?${qs(args)}`,
      providesTags: ["AdminProduct"],
    }),
    adminUpdateProduct: build.mutation<any, { id: string; status?: string; isFeatured?: boolean; isVerified?: boolean; linkType?: string; plan?: string; rejectionReason?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/products/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Product", "AdminProduct"],
    }),
    adminDeleteProduct: build.mutation<any, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product", "AdminProduct"],
    }),

    getAdminUsers: build.query<AdminUsersResponse, ListArgs>({
      query: (args = {}) => `/admin/users?${qs(args)}`,
      providesTags: ["AdminUser"],
    }),
    getAdminUser: build.query<AdminUserDetail, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: "AdminUser", id }],
    }),
    updateUser: build.mutation<AdminUser, { id: string } & Record<string, unknown>>({
      query: ({ id, ...body }) => ({ url: `/admin/users/${id}`, method: "PATCH", body }),
      invalidatesTags: ["AdminUser", "User", "AdminLog"],
    }),
    adminLogoutUser: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/admin/users/${id}/logout`, method: "POST" }),
      invalidatesTags: ["AdminLog"],
    }),
    adminEmailUser: build.mutation<{ message: string }, { id: string; subject: string; message: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/users/${id}/email`, method: "POST", body }),
      invalidatesTags: ["AdminEmail", "AdminLog"],
    }),
    adminDeleteUser: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminUser", "AdminLog"],
    }),
    getAdminSubscriptions: build.query<{ users: AdminUser[]; total: number; pages: number }, ListArgs>({
      query: (args = {}) => `/admin/subscriptions?${qs(args)}`,
      providesTags: ["AdminUser"],
    }),

    getAdminPosts: build.query<{ posts: any[]; total: number; pages: number }, ListArgs>({
      query: (args = {}) => `/admin/posts?${qs(args)}`,
      providesTags: ["AdminPost"],
    }),
    adminDeletePost: build.mutation<any, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/admin/posts/${id}`, method: "DELETE", body: { reason } }),
      invalidatesTags: ["AdminPost", "AdminLog"],
    }),

    getAdminReports: build.query<{ reports: any[]; total: number; pages: number }, ListArgs>({
      query: (args = {}) => `/admin/reports?${qs(args)}`,
      providesTags: ["AdminReport"],
    }),
    resolveReport: build.mutation<any, { id: string; action: string; note?: string; suspendDays?: number }>({
      query: ({ id, ...body }) => ({ url: `/admin/reports/${id}`, method: "PATCH", body }),
      invalidatesTags: ["AdminReport", "AdminPost", "AdminUser", "AdminLog"],
    }),

    getAdminPayments: build.query<{ payments: any[]; total: number; pages: number; byPlan: { _id: string; n: number; revenue: number }[] }, ListArgs>({
      query: (args = {}) => `/admin/payments?${qs(args)}`,
      providesTags: ["AdminPayment"],
    }),
    updatePayment: build.mutation<any, { id: string; status: string; note?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/payments/${id}`, method: "PATCH", body }),
      invalidatesTags: ["AdminPayment", "AdminUser", "AdminProduct", "AdminLog"],
    }),

    getAdminSettings: build.query<PlatformSettings, void>({
      query: () => "/admin/settings",
      providesTags: ["AdminSettings"],
    }),
    updateAdminSettings: build.mutation<PlatformSettings, Partial<PlatformSettings>>({
      query: (body) => ({ url: "/admin/settings", method: "PATCH", body }),
      invalidatesTags: ["AdminSettings", "Platform", "AdminLog"],
    }),

    getAdminEmails: build.query<{ emails: any[]; total: number; pages: number; byStatus: Record<string, number>; byTemplate: { _id: string; n: number; sent: number }[]; templates: string[]; smtpConfigured: boolean }, ListArgs>({
      query: (args = {}) => `/admin/emails?${qs(args)}`,
      providesTags: ["AdminEmail"],
    }),
    retryEmail: build.mutation<any, string>({
      query: (id) => ({ url: `/admin/emails/${id}/retry`, method: "POST" }),
      invalidatesTags: ["AdminEmail"],
    }),
    cancelEmail: build.mutation<any, string>({
      query: (id) => ({ url: `/admin/emails/${id}/cancel`, method: "POST" }),
      invalidatesTags: ["AdminEmail"],
    }),
    retryFailedEmails: build.mutation<{ message: string }, void>({
      query: () => ({ url: "/admin/emails/retry-failed", method: "POST" }),
      invalidatesTags: ["AdminEmail"],
    }),
    sendTestEmail: build.mutation<{ message: string }, string>({
      query: (template) => ({ url: "/admin/emails/test", method: "POST", body: { template } }),
      invalidatesTags: ["AdminEmail"],
    }),
    sendBroadcast: build.mutation<{ message: string; recipients: number }, { subject: string; heading?: string; message: string; ctaLabel?: string; ctaUrl?: string; audience: string; channels: { email: boolean; inApp: boolean } }>({
      query: (body) => ({ url: "/admin/broadcast", method: "POST", body }),
      invalidatesTags: ["AdminEmail", "AdminLog"],
    }),

    getAdminLogs: build.query<{ logs: any[]; total: number; pages: number }, ListArgs>({
      query: (args = {}) => `/admin/logs?${qs(args)}`,
      providesTags: ["AdminLog"],
    }),

    updateChallenge: build.mutation<any, { theme: string; description?: string }>({
      query: (body) => ({ url: "/admin/challenge", method: "PUT", body }),
      invalidatesTags: ["AdminLog"],
    }),

    getSeedPreview: build.query<{ users: SeedPreviewUser[]; products: SeedPreviewProduct[] }, void>({
      query: () => "/admin/seed-preview",
    }),
  }),
});

export const {
  useGetAdminStatsQuery, useGetAdminAnalyticsQuery,
  useGetAdminProductsQuery, useAdminUpdateProductMutation, useAdminDeleteProductMutation,
  useGetAdminUsersQuery, useGetAdminUserQuery, useUpdateUserMutation, useAdminLogoutUserMutation, useAdminEmailUserMutation, useAdminDeleteUserMutation,
  useGetAdminSubscriptionsQuery,
  useGetAdminPostsQuery, useAdminDeletePostMutation,
  useGetAdminReportsQuery, useResolveReportMutation,
  useGetAdminPaymentsQuery, useUpdatePaymentMutation,
  useGetAdminSettingsQuery, useUpdateAdminSettingsMutation,
  useGetAdminEmailsQuery, useRetryEmailMutation, useCancelEmailMutation, useRetryFailedEmailsMutation, useSendTestEmailMutation, useSendBroadcastMutation,
  useGetAdminLogsQuery, useUpdateChallengeMutation,
  useGetSeedPreviewQuery,
} = adminApi;
