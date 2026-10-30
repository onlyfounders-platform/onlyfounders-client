import { baseApi } from "./baseApi";

export interface WeeklySpotlightProduct {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  logo?: string;
  upvoteCount: number;
  makers: { _id: string; name: string; username: string; avatar?: string }[];
}

export interface CurrentChallenge {
  challenge: { theme: string; description: string; weekStart: string };
  spotlightProduct: WeeklySpotlightProduct | null;
}

export const challengesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCurrentChallenge: build.query<CurrentChallenge, void>({
      query: () => "/challenges/current",
    }),
  }),
});

export const { useGetCurrentChallengeQuery } = challengesApi;
