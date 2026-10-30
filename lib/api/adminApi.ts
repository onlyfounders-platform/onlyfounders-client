import { baseApi } from "./baseApi";

export interface AdminStats {
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  totalUsers: number;
  totalUpvotes: number;
  totalComments: number;
}

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  logo?: string;
  tags: string[];
  category?: string;
  status: "pending" | "approved" | "rejected";
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

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminStats: build.query<AdminStats, void>({
      query: () => "/admin/stats",
      providesTags: ["AdminProduct", "User"],
    }),

    getAdminProducts: build.query<
      AdminProductsResponse,
      { status?: string; page?: number; search?: string }
    >({
      query: ({ status = "", page = 1, search = "" } = {}) =>
        `/admin/products?status=${status}&page=${page}&search=${encodeURIComponent(search)}`,
      providesTags: ["AdminProduct"],
    }),

    adminUpdateProduct: build.mutation<
      any,
      {
        id: string;
        status?: string;
        isFeatured?: boolean;
        isVerified?: boolean;
        linkType?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/products/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Product", "AdminProduct"],
    }),

    adminDeleteProduct: build.mutation<any, string>({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "AdminProduct"],
    }),

    getAdminUsers: build.query<
      AdminUsersResponse,
      { page?: number; search?: string }
    >({
      query: ({ page = 1, search = "" } = {}) =>
        `/admin/users?page=${page}&search=${encodeURIComponent(search)}`,
      providesTags: ["User"],
    }),

    updateUser: build.mutation<any, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),

    getSeedPreview: build.query<{ users: SeedPreviewUser[]; products: SeedPreviewProduct[] }, void>({
      query: () => "/admin/seed-preview",
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminProductsQuery,
  useAdminUpdateProductMutation,
  useAdminDeleteProductMutation,
  useGetAdminUsersQuery,
  useUpdateUserMutation,
  useGetSeedPreviewQuery,
} = adminApi;
