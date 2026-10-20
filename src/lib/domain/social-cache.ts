import type { Post } from '../data';

export interface SocialData {
  posts: Post[];
  likes: { post_id: string; user_id: string }[];
}

export function setCachedLike<T extends SocialData>(data: T, postId: string, userId: string, active: boolean): T {
  const hadLike = data.likes.some(l => l.post_id === postId && l.user_id === userId);
  if (hadLike === active) return data;
  return {
    ...data,
    likes: active ? [...data.likes, { post_id: postId, user_id: userId }] : data.likes.filter(l => l.post_id !== postId || l.user_id !== userId),
    posts: data.posts.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes + (active ? 1 : -1)) } : p),
  };
}

export function addCachedComment<T extends SocialData>(data: T, postId: string, comment: Post['comentarios'][number]): T {
  return { ...data, posts: data.posts.map(p => p.id === postId ? { ...p, comentarios: [...p.comentarios, comment] } : p) };
}

export function removeCachedComment<T extends SocialData>(data: T, commentId: string): T {
  return { ...data, posts: data.posts.map(p => ({ ...p, comentarios: p.comentarios.filter(c => c.id !== commentId) })) };
}