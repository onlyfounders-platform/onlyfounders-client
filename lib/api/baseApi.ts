import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { bootstrapSession } from "./bootstrapSession";
import { logout } from "../slices/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api",
  credentials: "include",
});

// The session lives in one long-lived httpOnly cookie the browser attaches
// automatically (credentials: "include") — no Authorization header, no
// refresh exchange. The only thing this wrapper still does is make sure
// Redux's `user`/`status` are populated before the very first request goes
// out (a fresh page load starts with status "idle"), and clear them if the
// server ever says the cookie isn't valid.
const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url;
  const isAuthFlowEndpoint = /\/auth\/(me|login|register)$/.test(url);

  if (!isAuthFlowEndpoint && (api.getState() as RootState).auth.status === "idle") {
    await bootstrapSession(api.dispatch);
  }

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !isAuthFlowEndpoint) {
    api.dispatch(logout());
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Product", "User", "Upvote", "Notification", "Badge", "Company", "AdminProduct", "Post", "PostComments", "SavedPosts", "Conversation"],
  endpoints: () => ({}),
});
