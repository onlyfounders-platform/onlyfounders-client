import { baseApi } from "./baseApi";

export const upvotesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    toggleUpvote: build.mutation({
      query: (productId: string) => ({
        url: `/upvotes/${productId}`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, productId) => [
        { type: "Upvote", id: productId },
        "Product",
      ],
    }),
  }),
});

export const { useToggleUpvoteMutation } = upvotesApi;
