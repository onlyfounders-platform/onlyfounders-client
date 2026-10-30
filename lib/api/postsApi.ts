import { baseApi } from "./baseApi";
import type { Achievement } from "./usersApi";

export interface PostAuthor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

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
}

interface PostsPage {
  posts: Post[];
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
    getFeed: build.query<PostsPage, { page: number; limit?: number; following?: boolean; search?: string }>({
      query: ({ page, limit = 10, following, search }) =>
        `/posts?page=${page}&limit=${limit}${following ? "&following=true" : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
    }),

    getUserPosts: build.query<PostsPage, { username: string; page: number; limit?: number }>({
      query: ({ username, page, limit = 10 }) => `/posts/user/${username}?page=${page}&limit=${limit}`,
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
