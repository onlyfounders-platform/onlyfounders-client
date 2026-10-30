import { baseApi } from "./baseApi";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<any, { period?: string; category?: string; page?: number; from?: string; to?: string; limit?: number } | undefined>({
      query: ({ period = "today", category = "", page = 1, from, to, limit } = {}) => {
        const params = new URLSearchParams({ period, category, page: String(page) });
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (limit) params.set("limit", String(limit));
        return `/products?${params.toString()}`;
      },
      providesTags: ["Product"],
    }),

    getProduct: build.query({
      query: (slug: string) => `/products/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: "Product", id: slug }],
    }),

    submitProduct: build.mutation({
      query: (formData: FormData) => ({
        url: "/products",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    getComments: build.query({
      query: (slug: string) => `/products/${slug}/comments`,
      providesTags: (_r, _e, slug) => [{ type: "Product", id: `comments-${slug}` }],
    }),

    addComment: build.mutation({
      query: ({ slug, body, parentId }: { slug: string; body: string; parentId?: string }) => ({
        url: `/products/${slug}/comments`,
        method: "POST",
        body: { body, parentId },
      }),
      invalidatesTags: (_r, _e, { slug }) => [{ type: "Product", id: `comments-${slug}` }],
    }),

    updateProductStatus: build.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/products/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: build.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: build.mutation({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useSubmitProductMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateProductStatusMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
