import { setCredentials, logout } from "../slices/authSlice";
import type { AppDispatch } from "../store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

let inFlight: Promise<void> | null = null;

// The session is one long-lived httpOnly cookie — no refresh exchange
// needed. On first load we just ask the server "who am I" (the cookie goes
// along automatically) and populate Redux from the answer.
async function doBootstrap(dispatch: AppDispatch): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        dispatch(setCredentials({ user: data.user }));
        return;
      }
    }
    if (res.status === 401) dispatch(logout());
    // Any other failure (offline, backend mid-restart, ...) says nothing
    // about the session itself — leave status as "idle" so the next request
    // tries the bootstrap again instead of wrongly declaring it invalid.
  } catch {
    // network error — same reasoning as above, leave status untouched
  }
}

export function bootstrapSession(dispatch: AppDispatch): Promise<void> {
  if (!inFlight) {
    inFlight = doBootstrap(dispatch).finally(() => { inFlight = null; });
  }
  return inFlight;
}
