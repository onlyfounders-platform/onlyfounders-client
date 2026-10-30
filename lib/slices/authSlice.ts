import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  reputation?: number;
  role?: string;
}

type AuthStatus = "idle" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  // Session lives entirely in a long-lived httpOnly cookie set by the
  // server — there's no token to hold in JS/Redux at all. Requests just
  // send the cookie automatically (fetchBaseQuery's credentials: "include").
  status: AuthStatus;
}

// `user` always starts null on both server and client — reading a cached
// value synchronously here would make the client's very first render differ
// from the server-rendered HTML (server always sees no `window`), which
// breaks hydration for anything that branches on `user` (e.g. Header's
// notification bell). AuthSync repopulates it via GET /auth/me right after
// mount, which succeeds or fails based on the httpOnly cookie.
const getInitialState = (): AuthState => ({
  user: null,
  status: "idle",
});

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser }>) {
      state.user = action.payload.user;
      state.status = "authenticated";
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
    },
    logout(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
