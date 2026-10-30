import { baseApi } from "./baseApi";

export const companiesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCompany: build.query({
      query: (slug: string) => `/companies/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: "Company", id: slug }],
    }),

    createCompany: build.mutation({
      query: (body) => ({
        url: "/companies",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Company"],
    }),
  }),
});

export const { useGetCompanyQuery, useCreateCompanyMutation } = companiesApi;
