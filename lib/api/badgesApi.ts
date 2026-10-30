import { baseApi } from "./baseApi";

export const badgesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBadgeEmbed: build.query({
      query: (slug: string) => `/badges/embed/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: "Badge", id: slug }],
    }),

    verifyBadge: build.mutation({
      query: (slug: string) => ({
        url: `/badges/verify/${slug}`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, slug) => [
        { type: "Badge", id: slug },
        { type: "Product", id: slug },
      ],
    }),
  }),
});

export const { useGetBadgeEmbedQuery, useVerifyBadgeMutation } = badgesApi;
