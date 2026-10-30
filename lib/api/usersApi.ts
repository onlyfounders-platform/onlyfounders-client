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

    getActivity: build.query<{ days: { date: string; count: number }[]; launchStreak: number; longestStreak: number }, string>({
      query: (username: string) => `/users/${username}/activity`,
      providesTags: (_r, _e, username) => [{ type: "User", id: `activity-${username}` }],
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
  useGetUserQuery,
  useToggleFollowMutation,
  useUpdateProfileMutation,
  useGetLeaderboardQuery,
  useGetAchievementsQuery,
  useGetActivityQuery,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
} = usersApi;
