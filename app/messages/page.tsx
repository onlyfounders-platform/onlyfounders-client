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
  const effectiveActiveId = activeId;
  const active = conversations.find(c => c._id === effectiveActiveId) ?? null;

  useEffect(() => {
    setActiveId(conversationParam);
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
    <AppShell title="Messages" hideRightSidebar fullHeight hideHeader centerMaxWidth={1050}>
      <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
        {showList && (
          <div
            style={{
              width: isMobile ? "100%" : 388,
              flexShrink: 0,
              borderRight: isMobile ? "none" : "1px solid var(--border)",
              minHeight: 0,
              height: "100%",
            }}
          >
            <ConversationList
              conversations={conversations}
              activeId={effectiveActiveId}
              onSelect={selectConversation}
              onNewMessage={() => setNewMessageOpen(true)}
              loading={isLoading}
              isMobile={isMobile}
            />
          </div>
        )}

        {showThread && (
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, height: "100%" }}>
            {active && me ? (
              <ChatThread
                key={active._id}
                conversationId={active._id}
                otherUser={active.otherUser}
                isMobile={isMobile}
                onBack={() => {
                  setActiveId(null);
                  router.replace("/messages", { scroll: false });
                }}
              />
            ) : (
              /* Exact Empty State matching Image 2 */
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: "#16181C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <MessageCircle size={32} strokeWidth={2} style={{ color: "#E7E9EA" }} />
                </div>

                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#E7E9EA",
                    letterSpacing: "-0.5px",
                    marginBottom: 8,
                  }}
                >
                  Start Conversation
                </h2>

                <p
                  style={{
                    fontSize: "var(--font-base)",
                    color: "#71767B",
                    maxWidth: 340,
                    lineHeight: 1.4,
                    marginBottom: 22,
                  }}
                >
                  Choose from your existing conversations, or start a new one.
                </p>

                <button
                  onClick={() => setNewMessageOpen(true)}
                  style={{
                    background: "#FFFFFF",
                    color: "#000000",
                    border: "none",
                    borderRadius: 9999,
                    padding: "10px 22px",
                    fontSize: "var(--font-base)",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#E6E6E6")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}
                >
                  New chat
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <NewMessageModal
        open={newMessageOpen}
        onClose={() => setNewMessageOpen(false)}
        onSelect={handlePickUser}
        excludeUsername={me?.username}
      />
    </AppShell>
  );
}
