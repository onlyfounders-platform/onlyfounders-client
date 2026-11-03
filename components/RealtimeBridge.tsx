"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getSocket } from "@/lib/socket";
import { baseApi } from "@/lib/api/baseApi";
import { useToast } from "@/components/ui/Toast";
import Avatar from "@/components/ui/Avatar";

// Live updates over the shared socket: a new notification refreshes the bell
// badge immediately (instead of waiting for the 30s poll) and shows a toast.
export default function RealtimeBridge() {
  const user = useAppSelector(s => s.auth.user);
  const dispatch = useAppDispatch();
  const { push } = useToast();

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    const onNotification = (n: any) => {
      dispatch(baseApi.util.invalidateTags(["Notification"]));
      // Achievements are already toasted by the action that unlocked them.
      if (n.type === "achievement") return;
      if (typeof document !== "undefined" && document.visibilityState === "visible" && !window.location.pathname.startsWith("/notifications")) {
        push({
          title: n.message,
          icon: n.actor ? <Avatar src={n.actor.avatar} name={n.actor.name} size={28} /> : undefined,
        });
      }
    };
    const onMessage = () => dispatch(baseApi.util.invalidateTags(["Conversation"]));
    socket.on("notification:new", onNotification);
    socket.on("message:new", onMessage);
    return () => {
      socket.off("notification:new", onNotification);
      socket.off("message:new", onMessage);
    };
  }, [user, dispatch, push]);

  return null;
}
