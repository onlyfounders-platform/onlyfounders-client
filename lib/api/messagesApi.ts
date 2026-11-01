import { baseApi } from "./baseApi";

export interface ChatUser {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  createdAt?: string;
  followers?: string[];
  followersCount?: number;
  badges?: string[];
  verified?: boolean;
}

export interface ConversationSummary {
  _id: string;
  otherUser: ChatUser;
  lastMessage: { text: string; createdAt: string; sender: string } | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: ChatUser | string;
  text: string;
  readBy: string[];
  createdAt: string;
}

export const messagesApi = baseApi.injectEndpoints({
  overrideExisting: process.env.NODE_ENV !== "production",
  endpoints: (build) => ({
    getConversations: build.query<{ conversations: ConversationSummary[] }, void>({
      query: () => "/messages/conversations",
      providesTags: ["Conversation"],
    }),

    startConversation: build.mutation<{ conversation: ConversationSummary & { participants: ChatUser[] } }, string>({
      query: (username) => ({ url: "/messages/conversations", method: "POST", body: { username } }),
      invalidatesTags: ["Conversation"],
    }),

    getMessages: build.query<{ messages: ChatMessage[]; hasMore: boolean }, { conversationId: string; page?: number }>({
      query: ({ conversationId, page = 1 }) => `/messages/conversations/${conversationId}/messages?page=${page}&limit=30`,
    }),

    sendMessageRest: build.mutation<{ message: ChatMessage }, { conversationId: string; text: string }>({
      query: ({ conversationId, text }) => ({
        url: `/messages/conversations/${conversationId}/messages`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Conversation"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useStartConversationMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useSendMessageRestMutation,
} = messagesApi;
