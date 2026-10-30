import { baseApi } from "./baseApi";

export interface ScrapeResult {
  name: string;
  tagline: string;
  description: string;
  logo: string;
  website: string;
}

export const scrapeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    scrapeUrl: build.query<ScrapeResult, string>({
      query: (url) => `/scrape?url=${encodeURIComponent(url)}`,
    }),
    checkBadgeOnSite: build.query<{ verified: boolean }, string>({
      query: (url) => `/scrape/verify-badge?url=${encodeURIComponent(url)}`,
    }),
  }),
});

export const { useLazyScrapeUrlQuery, useLazyCheckBadgeOnSiteQuery } = scrapeApi;
