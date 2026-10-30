"use client";
import { useEffect, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { setCredentials } from "@/lib/slices/authSlice";
import { useGoogleLoginMutation } from "@/lib/api/authApi";

const GSI_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function loadGsiScript(): Promise<void> {
  if (document.querySelector(`script[src="${GSI_SRC}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });
}

// Renders Google's own "Sign in with Google" button via Identity Services.
// The button hands us a signed ID token (no redirect/callback route needed);
// we POST it to /api/auth/google, which verifies it server-side and issues
// the same httpOnly session cookie as a normal login.
export default function GoogleSignInButton({ onError }: { onError?: (message: string) => void }) {
  const containerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [googleLogin] = useGoogleLoginMutation();

  useEffect(() => {
    if (!CLIENT_ID) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set — Google sign-in disabled");
      return;
    }

    let cancelled = false;

    loadGsiScript().then(() => {
      if (cancelled || !containerRef.current) return;
      const google = (window as any).google;

      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response: { credential: string }) => {
          try {
            const result = await googleLogin({ credential: response.credential }).unwrap();
            dispatch(setCredentials({ user: result.user }));
            router.push("/feed");
          } catch (err: any) {
            onError?.(err?.data?.message || "Google sign-in failed");
          }
        },
      });

      google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: 336,
        shape: "pill",
        text: "continue_with",
      });
    }).catch(() => onError?.("Google sign-in failed to load"));

    return () => { cancelled = true; };
  }, [dispatch, googleLogin, router, onError]);

  if (!CLIENT_ID) return null;

  return <div id={containerId} ref={containerRef} style={{ display: "flex", justifyContent: "center" }} />;
}
