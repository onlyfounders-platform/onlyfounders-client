import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";

// Import all api modules so endpoints get injected
import "./api/authApi";
import "./api/productsApi";
import "./api/upvotesApi";
import "./api/usersApi";
import "./api/badgesApi";
import "./api/notificationsApi";
import "./api/paymentsApi";
import "./api/companiesApi";
import "./api/postsApi";
import "./api/challengesApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
