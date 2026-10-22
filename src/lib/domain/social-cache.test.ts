import { describe, expect, it } from 'vitest';
import { addComment, removeComment, setLikedFlag, shiftComments, shiftLikes, type FeedPages } from './social-cache';

const author = { id: 'owner', nome: 'Dono', iniciais: 'D' };
const post = (id: string) => ({ id, autor: 'owner', author, tipo: 'Treino' as const, texto: 'Treino', modalidade: 'Corrida', cidade: 'Palmares', tempo: '', created_at: '', image_path: null, likes: 0, comentarios: 0 });
const fixture = (): FeedPages => ({ pageParams: [null, 'c'], pages: [{ posts: [post('a')], nextCursor: null }, { posts: [post('b')], nextCursor: null }] });

describe('instant social feedback on the paginated feed', () => {
  it('adds one like to the right post on any loaded page', () => {
    const data = shiftLikes(fixture(), 'b', 1);
    expect(data.pages[1]?.posts[0]?.likes).toBe(1);
    expect(data.pages[0]?.posts[0]?.likes).toBe(0);
  });
  it('never shows a negative like count after a rollback', () => {
    expect(shiftLikes(fixture(), 'a', -1).pages[0]?.posts[0]?.likes).toBe(0);
  });
  it('counts a new comment without loading the comment list', () => {
    expect(shiftComments(fixture(), 'a', 1).pages[0]?.posts[0]?.comentarios).toBe(1);
  });
  it('marks a like only for posts the viewer has loaded', () => {
    expect(setLikedFlag({ a: false }, 'a', true)).toEqual({ a: true });
    expect(setLikedFlag({ a: false }, 'x', true)).toEqual({ a: false });
  });
  it('removes only the failed comment and preserves concurrent comments', () => {
    const c = (id: string) => ({ id, autor: 'u', autorNome: 'U', texto: id, created_at: '' });
    const list = addComment(addComment([], c('pending')), c('other'));
    expect(removeComment(list, 'pending').map(x => x.id)).toEqual(['other']);
  });
});
