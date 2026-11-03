import { baseApi } from "./baseApi";

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<any, { filter?: "all" | "mentions" } | void>({
      query: (args) => `/notifications${args && args.filter === "mentions" ? "?filter=mentions" : ""}`,
      providesTags: ["Notification"],
    }),

    deleteNotification: build.mutation<any, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notification"],
    }),

    markAllRead: build.mutation({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markNotificationRead: build.mutation<any, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAllReadMutation, useMarkNotificationReadMutation, useDeleteNotificationMutation } = notificationsApi;
