"use client";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { bootstrapSession } from "@/lib/api/bootstrapSession";

// The session cookie is long-lived, so there's nothing to proactively renew
// — this just asks once on mount whether the browser's cookie still
// resolves to a user, and populates Redux from the answer.
export default function AuthSync() {
  const dispatch = useAppDispatch();
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    bootstrapSession(dispatch);
  }, [dispatch]);

  return null;
}
