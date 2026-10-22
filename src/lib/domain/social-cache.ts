import type { Comentario, FeedPage, Post } from '../data';

/** Infinite-query shape used for every feed (home, by type, by author). */
export interface FeedPages { pages: FeedPage[]; pageParams: unknown[] }

export function updateFeedPost(data: FeedPages, postId: string, fn: (p: Post) => Post): FeedPages {
  let changed = false;
  const pages = data.pages.map(page => {
    if (!page.posts.some(p => p.id === postId)) return page;
    changed = true;
    return { ...page, posts: page.posts.map(p => p.id === postId ? fn(p) : p) };
  });
  return changed ? { ...data, pages } : data;
}

export const shiftLikes = (data: FeedPages, postId: string, delta: number) =>
  updateFeedPost(data, postId, p => ({ ...p, likes: Math.max(0, p.likes + delta) }));

export const shiftComments = (data: FeedPages, postId: string, delta: number) =>
  updateFeedPost(data, postId, p => ({ ...p, comentarios: Math.max(0, p.comentarios + delta) }));

/** Liked flags for the posts a viewer has loaded; only known posts change. */
export function setLikedFlag(flags: Record<string, boolean>, postId: string, active: boolean): Record<string, boolean> {
  if (!(postId in flags) || flags[postId] === active) return flags;
  return { ...flags, [postId]: active };
}

export const addComment = (list: Comentario[], comment: Comentario) => [...list, comment];
export const removeComment = (list: Comentario[], commentId: string) => list.filter(c => c.id !== commentId);
