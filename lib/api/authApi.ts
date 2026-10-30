import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: build.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    googleLogin: build.mutation<{ user: any }, { credential: string }>({
      query: (body) => ({ url: "/auth/google", method: "POST", body }),
    }),
    requestOtp: build.mutation<
      { message: string; expiresIn: number },
      { email: string; purpose: "login" | "register"; name?: string; username?: string }
    >({
      query: (body) => ({ url: "/auth/otp/request", method: "POST", body }),
    }),
    verifyOtp: build.mutation<
      { user: any },
      { email: string; purpose: "login" | "register"; code: string }
    >({
      query: (body) => ({ url: "/auth/otp/verify", method: "POST", body }),
    }),
    getMe: build.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    logout: build.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

export const {
  useRegisterMutation, useLoginMutation, useGoogleLoginMutation,
  useGetMeQuery, useLogoutMutation,
  useRequestOtpMutation, useVerifyOtpMutation,
} = authApi;
