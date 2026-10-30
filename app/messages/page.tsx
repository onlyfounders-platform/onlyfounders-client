"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import ConversationList from "@/components/messages/ConversationList";
import ChatThread from "@/components/messages/ChatThread";
import NewMessageModal from "@/components/messages/NewMessageModal";
import { useGetConversationsQuery, useStartConversationMutation, type ConversationSummary } from "@/lib/api/messagesApi";
import { useAppSelector } from "@/lib/hooks";
import { useMediaQuery } from "@/lib/hooks";
import RequireAuth from "@/components/auth/RequireAuth";
import { MessageCircle } from "lucide-react";

const POLL_MS = 15000;

export default function MessagesPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <MessagesContent />
      </Suspense>
    </RequireAuth>
  );
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get("c");
  const me = useAppSelector(s => s.auth.user);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data, isLoading } = useGetConversationsQuery(undefined, { pollingInterval: POLL_MS });
  const [startConversation] = useStartConversationMutation();
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(conversationParam);

  const conversations = useMemo(() => data?.conversations ?? [], [data]);
  // Falls back to the first conversation on desktop (where a thread is
  // always visible alongside the list) without needing an effect — mobile
  // stays on the list view until the user actually picks one.
  const effectiveActiveId = activeId ?? (!isMobile && conversations.length > 0 ? conversations[0]._id : null);
  const active = conversations.find(c => c._id === effectiveActiveId) ?? null;

  useEffect(() => {
    if (conversationParam) setActiveId(conversationParam);
  }, [conversationParam]);

  const selectConversation = (c: ConversationSummary) => {
    setActiveId(c._id);
    router.replace(`/messages?c=${c._id}`, { scroll: false });
  };

  const handlePickUser = async (username: string) => {
    setNewMessageOpen(false);
    try {
      const res = await startConversation(username).unwrap();
      setActiveId(res.conversation._id);
      router.replace(`/messages?c=${res.conversation._id}`, { scroll: false });
    } catch {
      // conversation creation failed silently — user can retry from the modal
    }
  };

  const showList = !isMobile || !effectiveActiveId;
  const showThread = !isMobile || !!effectiveActiveId;

  return (
    <AppShell title="Messages" hideRightSidebar fullHeight>
      <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
        {showList && (
          <div style={{ width: isMobile ? "100%" : 340, flexShrink: 0, borderRight: isMobile ? "none" : "1px solid var(--border)", minHeight: 0 }}>
            <ConversationList
              conversations={conversations}
              activeId={effectiveActiveId}
              onSelect={selectConversation}
              onNewMessage={() => setNewMessageOpen(true)}
              loading={isLoading}
            />
          </div>
        )}

        {showThread && (
          <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
            {active && me ? (
              <ChatThread
                key={active._id}
                conversationId={active._id}
                otherUser={active.otherUser}
                isMobile={isMobile}
                onBack={() => { setActiveId(null); router.replace("/messages", { scroll: false }); }}
              />
            ) : (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%", background: "var(--accent-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 0 10px var(--accent-glow-soft)", marginBottom: 4,
                }}>
                  <MessageCircle size={28} style={{ color: "var(--accent)" }} />
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", maxWidth: 260 }}>
                  Select a conversation, or start a new one with a founder you'd like to connect with.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <NewMessageModal open={newMessageOpen} onClose={() => setNewMessageOpen(false)} onSelect={handlePickUser} excludeUsername={me?.username} />
    </AppShell>
  );
}
