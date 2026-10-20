import { describe, expect, it } from 'vitest';
import { addCachedComment, removeCachedComment, setCachedLike, type SocialData } from './social-cache';

const fixture = (): SocialData => ({
  likes: [],
  posts: [{ id: 'post', autor: 'owner', tipo: 'Treino', texto: 'Treino', modalidade: 'Corrida', cidade: 'Palmares', tempo: '', image_path: null, likes: 0, comentarios: [] }],
});

describe('instant social feedback', () => {
  it('adds a like immediately and does not duplicate it', () => {
    const liked = setCachedLike(fixture(), 'post', 'athlete', true);
    expect(liked.posts[0]?.likes).toBe(1);
    expect(setCachedLike(liked, 'post', 'athlete', true).likes).toHaveLength(1);
  });
  it('rolls back only the failed user like, preserving other likes', () => {
    const data = setCachedLike(setCachedLike(fixture(), 'post', 'athlete', true), 'post', 'other', true);
    const rolledBack = setCachedLike(data, 'post', 'athlete', false);
    expect(rolledBack.likes).toEqual([{ post_id: 'post', user_id: 'other' }]);
    expect(rolledBack.posts[0]?.likes).toBe(1);
  });
  it('shows a comment immediately without changing the original cache', () => {
    const original = fixture();
    const updated = addCachedComment(original, 'post', { id: 'pending', autor: 'athlete', texto: 'Bom treino!' });
    expect(updated.posts[0]?.comentarios[0]?.texto).toBe('Bom treino!');
    expect(original.posts[0]?.comentarios).toHaveLength(0);
  });
  it('removes only the failed comment and preserves concurrent comments', () => {
    const data = addCachedComment(addCachedComment(fixture(), 'post', { id: 'pending', autor: 'athlete', texto: 'Primeiro' }), 'post', { id: 'other', autor: 'other', texto: 'Segundo' });
    expect(removeCachedComment(data, 'pending').posts[0]?.comentarios).toEqual([{ id: 'other', autor: 'other', texto: 'Segundo' }]);
  });
});