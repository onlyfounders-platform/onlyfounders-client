import { baseApi } from "./baseApi";
import type { Achievement } from "./usersApi";

export interface PostAuthor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  isVerified?: boolean;
  subscription?: { plan?: string };
}

export type ReplySetting = "everyone" | "following" | "mentioned";

export interface Post {
  _id: string;
  author: PostAuthor;
  text: string;
  images: string[];
  likeCount: number;
  commentCount: number;
  repostCount: number;
  liked: boolean;
  saved: boolean;
  reposted: boolean;
  isEdited: boolean;
  hashtags?: string[];
  viewCount?: number;
  replySetting?: ReplySetting;
  createdAt: string;
  updatedAt: string;
  // Set only on a repost record — the original post whose content it mirrors.
  // Every like/save/comment/repost action targets repostOf._id when present.
  repostOf?: Post | null;
}

export interface PostComment {
  _id: string;
  post: string;
  author: PostAuthor;
  body: string;
  createdAt: string;
  likeCount?: number;
  liked?: boolean;
}

export interface ReplyItem extends Omit<PostComment, "post"> {
  post: { _id: string; text: string; images: string[]; createdAt: string; author: PostAuthor };
}

interface PostsPage {
  posts: Post[];
  pinned?: Post | null;
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
}

interface CommentsPage {
  comments: PostComment[];
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
}

export const postsApi = baseApi.injectEndpoints({
  // Turbopack dev sometimes bundles this module into both the shared store
  // chunk and a route-specific chunk (e.g. /feed), evaluating it twice with
  // identical endpoint definitions. overrideExisting silences RTK Query's
  // (harmless, dev-only) duplicate-registration warning for that case —
  // production builds emit a single bundle so this never triggers there.
  overrideExisting: process.env.NODE_ENV !== "production",
  endpoints: (build) => ({
    getFeed: build.query<PostsPage, { page: number; limit?: number; following?: boolean; search?: string; media?: boolean }>({
      query: ({ page, limit = 10, following, search, media }) =>
        `/posts?page=${page}&limit=${limit}${following ? "&following=true" : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}${media ? "&media=true" : ""}`,
    }),

    getUserPosts: build.query<PostsPage, { username: string; page: number; limit?: number; media?: boolean }>({
      query: ({ username, page, limit = 10, media }) => `/posts/user/${username}?page=${page}&limit=${limit}${media ? "&media=true" : ""}`,
    }),

    getLikedPosts: build.query<PostsPage, { username: string; page: number; limit?: number }>({
      query: ({ username, page, limit = 10 }) => `/posts/liked/${username}?page=${page}&limit=${limit}`,
    }),

    getUserReplies: build.query<{ replies: ReplyItem[]; hasMore: boolean; total: number }, { username: string; page: number; limit?: number }>({
      query: ({ username, page, limit = 10 }) => `/posts/replies/${username}?page=${page}&limit=${limit}`,
    }),

    getPost: build.query<{ post: Post; canReply: boolean }, string>({
      query: (id) => `/posts/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Post", id }],
    }),

    getTrendingHashtags: build.query<{ hashtags: { tag: string; count: number }[] }, number | void>({
      query: (limit = 6) => `/posts/trending/hashtags?limit=${limit}`,
    }),

    togglePin: build.mutation<{ pinned: boolean }, string>({
      query: (id) => ({ url: `/posts/${id}/pin`, method: "POST" }),
      invalidatesTags: ["User"],
    }),

    toggleCommentLike: build.mutation<{ liked: boolean; likeCount: number }, { postId: string; commentId: string }>({
      query: ({ postId, commentId }) => ({ url: `/posts/${postId}/comments/${commentId}/like`, method: "POST" }),
    }),

    getSavedPosts: build.query<PostsPage, { page: number; limit?: number }>({
      query: ({ page, limit = 10 }) => `/posts/saved/me?page=${page}&limit=${limit}`,
    }),

    createPost: build.mutation<{ post: Post; unlockedAchievements?: Achievement[] }, FormData>({
      query: (formData) => ({ url: "/posts", method: "POST", body: formData }),
    }),

    updatePost: build.mutation<{ post: Post }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({ url: `/posts/${id}`, method: "PATCH", body: formData }),
    }),

    deletePost: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/posts/${id}`, method: "DELETE" }),
    }),

    toggleLike: build.mutation<{ liked: boolean; likeCount: number }, string>({
      query: (id) => ({ url: `/posts/${id}/like`, method: "POST" }),
    }),

    toggleSave: build.mutation<{ saved: boolean }, string>({
      query: (id) => ({ url: `/posts/${id}/save`, method: "POST" }),
    }),

    toggleRepost: build.mutation<{ reposted: boolean; repostCount: number }, string>({
      query: (id) => ({ url: `/posts/${id}/repost`, method: "POST" }),
    }),

    getPostComments: build.query<CommentsPage, { postId: string; page: number; limit?: number }>({
      query: ({ postId, page, limit = 20 }) => `/posts/${postId}/comments?page=${page}&limit=${limit}`,
    }),

    addPostComment: build.mutation<{ comment: PostComment; commentCount: number }, { postId: string; body: string }>({
      query: ({ postId, body }) => ({ url: `/posts/${postId}/comments`, method: "POST", body: { body } }),
    }),

    deleteComment: build.mutation<{ success: boolean; commentCount: number }, { postId: string; commentId: string }>({
      query: ({ postId, commentId }) => ({ url: `/posts/${postId}/comments/${commentId}`, method: "DELETE" }),
    }),
  }),
});

export const {
  useLazyGetLikedPostsQuery,
  useLazyGetUserRepliesQuery,
  useGetPostQuery,
  useGetTrendingHashtagsQuery,
  useTogglePinMutation,
  useToggleCommentLikeMutation,
  useGetFeedQuery,
  useLazyGetFeedQuery,
  useGetUserPostsQuery,
  useLazyGetUserPostsQuery,
  useGetSavedPostsQuery,
  useLazyGetSavedPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikeMutation,
  useToggleSaveMutation,
  useToggleRepostMutation,
  useGetPostCommentsQuery,
  useLazyGetPostCommentsQuery,
  useAddPostCommentMutation,
  useDeleteCommentMutation,
} = postsApi;
