import { baseApi } from "./baseApi";

export interface Achievement {
  key: string;
  label: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  unlocked: boolean;
  unlockedAt: string | null;
}

export const OPEN_TO_OPTIONS = ["cofounder", "mentorship", "investment", "hiring", "networking", "collaborators"] as const;
export type OpenToTag = typeof OPEN_TO_OPTIONS[number];

export const OPEN_TO_LABELS: Record<OpenToTag, string> = {
  cofounder: "Co-founder",
  mentorship: "Mentorship",
  investment: "Investment",
  hiring: "Hiring",
  networking: "Networking",
  collaborators: "Collaborators",
};

export interface SearchUser {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  openTo: OpenToTag[];
  reputation: number;
  isFollowing: boolean;
}

export interface SuggestedUser {
  _id: string; name: string; username: string; avatar?: string; bio?: string;
  isVerified?: boolean; followerCount: number; followsYou: boolean;
}

export type PrefMap = Record<string, boolean>;
export interface UserSettings {
  account: {
    name: string; username: string; email: string; createdAt: string; hasPassword: boolean; googleLinked: boolean;
    isEmailVerified: boolean; status: string; lastLoginAt?: string; role: string;
  };
  subscription: { plan: "free" | "starter" | "pro"; status: string; startedAt?: string; expiresAt?: string; source?: string };
  notificationPrefs: { email: PrefMap; inApp: PrefMap };
  categories: { key: string; label: string; locked: boolean }[];
  privacy: { dmPolicy: "everyone" | "following" | "nobody"; showActivity: boolean; discoverable: boolean; showFollowLists: boolean };
  display: { accent: string; fontSize: "sm" | "md" | "lg" | "xl"; reduceMotion: boolean };
  counts: { blocked: number; muted: number };
}

export interface RelationshipUser { _id: string; name: string; username: string; avatar?: string; bio?: string }

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUser: build.query({
      query: (username: string) => `/users/${username}`,
      providesTags: (_r, _e, username) => [{ type: "User", id: username }],
    }),

    toggleFollow: build.mutation({
      query: (username: string) => ({
        url: `/users/${username}/follow`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, username) => [{ type: "User", id: username }],
    }),

    updateProfile: build.mutation({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    getLeaderboard: build.query({
      query: () => "/users/leaderboard/top",
      providesTags: ["User"],
    }),

    getAchievements: build.query<{ achievements: Achievement[] }, string>({
      query: (username: string) => `/users/${username}/achievements`,
      providesTags: (_r, _e, username) => [{ type: "User", id: `achievements-${username}` }],
    }),

    getActivity: build.query<{ days: { date: string; count: number }[]; launchStreak: number; longestStreak: number; activeToday?: boolean; totals?: Record<string, number>; hidden?: boolean }, string>({
      query: (username: string) => `/users/${username}/activity?tz=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC")}`,
      providesTags: (_r, _e, username) => [{ type: "User", id: `activity-${username}` }],
    }),

    getSuggestions: build.query<{ users: SuggestedUser[] }, number | void>({
      query: (limit = 3) => `/users/suggestions/who-to-follow?limit=${limit}`,
      providesTags: [{ type: "User", id: "SUGGESTIONS" }],
    }),

    toggleBlock: build.mutation<{ blocked: boolean }, string>({
      query: (username) => ({ url: `/users/${username}/block`, method: "POST" }),
      invalidatesTags: (_r, _e, username) => [{ type: "User", id: username }, "Settings", { type: "User", id: "SUGGESTIONS" }],
    }),

    toggleMute: build.mutation<{ muted: boolean }, string>({
      query: (username) => ({ url: `/users/${username}/mute`, method: "POST" }),
      invalidatesTags: (_r, _e, username) => [{ type: "User", id: username }, "Settings"],
    }),

    getSettings: build.query<UserSettings, void>({
      query: () => "/users/me/settings",
      providesTags: ["Settings"],
    }),

    updateSettings: build.mutation<UserSettings, Partial<Pick<UserSettings, "privacy" | "display">> & { notificationPrefs?: { email?: PrefMap; inApp?: PrefMap } }>({
      query: (body) => ({ url: "/users/me/settings", method: "PATCH", body }),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        // Optimistic: toggles flip instantly, rolled back if the save fails.
        const undo = dispatch(usersApi.util.updateQueryData("getSettings", undefined, (draft) => {
          if (patch.privacy) Object.assign(draft.privacy, patch.privacy);
          if (patch.display) Object.assign(draft.display, patch.display);
          if (patch.notificationPrefs?.email) Object.assign(draft.notificationPrefs.email, patch.notificationPrefs.email);
          if (patch.notificationPrefs?.inApp) Object.assign(draft.notificationPrefs.inApp, patch.notificationPrefs.inApp);
        }));
        try { await queryFulfilled; } catch { undo.undo(); }
      },
    }),

    changeUsername: build.mutation<{ username: string }, string>({
      query: (username) => ({ url: "/users/me/username", method: "PATCH", body: { username } }),
      invalidatesTags: ["Settings", "User"],
    }),

    changePassword: build.mutation<{ message: string }, { currentPassword?: string; newPassword: string }>({
      query: (body) => ({ url: "/users/me/password", method: "POST", body }),
      invalidatesTags: ["Settings"],
    }),

    requestEmailChange: build.mutation<{ message: string; code?: string }, string>({
      query: (email) => ({ url: "/users/me/email/request", method: "POST", body: { email } }),
    }),

    verifyEmailChange: build.mutation<{ email: string }, { email: string; code: string }>({
      query: (body) => ({ url: "/users/me/email/verify", method: "POST", body }),
      invalidatesTags: ["Settings"],
    }),

    deactivateAccount: build.mutation<{ message: string }, void>({
      query: () => ({ url: "/users/me/deactivate", method: "POST" }),
    }),

    deleteAccount: build.mutation<{ message: string }, string>({
      query: (confirm) => ({ url: "/users/me", method: "DELETE", body: { confirm } }),
    }),

    getRelationships: build.query<{ users: RelationshipUser[] }, "blocked" | "muted">({
      query: (type) => `/users/me/relationships?type=${type}`,
      providesTags: ["Settings"],
    }),

    unsubscribe: build.query<{ message: string; label: string }, { u: string; c: string; t: string }>({
      query: ({ u, c, t }) => `/users/unsubscribe?u=${u}&c=${c}&t=${t}`,
    }),

    searchUsers: build.query<{ users: SearchUser[] }, { q?: string; openTo?: string }>({
      query: ({ q = "", openTo = "" }) => `/users/search?q=${encodeURIComponent(q)}&openTo=${openTo}`,
      // Tag each result by username (matching getUser's/toggleFollow's tag)
      // so following/unfollowing anywhere — this list, a profile page, the
      // follow-list modal — invalidates and refetches this cached search,
      // instead of it silently going stale until a full reload.
      providesTags: (result) =>
        result
          ? [...result.users.map(u => ({ type: "User" as const, id: u.username })), { type: "User" as const, id: "SEARCH_LIST" }]
          : [{ type: "User" as const, id: "SEARCH_LIST" }],
    }),
  }),
});

export const {
  useGetSuggestionsQuery,
  useToggleBlockMutation,
  useToggleMuteMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useChangeUsernameMutation,
  useChangePasswordMutation,
  useRequestEmailChangeMutation,
  useVerifyEmailChangeMutation,
  useDeactivateAccountMutation,
  useDeleteAccountMutation,
  useGetRelationshipsQuery,
  useUnsubscribeQuery,
  useGetUserQuery,
  useToggleFollowMutation,
  useUpdateProfileMutation,
  useGetLeaderboardQuery,
  useGetAchievementsQuery,
  useGetActivityQuery,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
} = usersApi;
