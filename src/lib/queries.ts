import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { getComments, getEvent, getEvents, getFeed, getOpportunities, getProfile, searchDirectory } from './platform.functions';
import type { FeedCursor } from './data';

/** Public reads stay fresh for a short shared window; writes invalidate them. */
const PUBLIC_STALE = 60 * 1000;

export interface FeedFilter { tipo?: string | undefined; autor?: string | undefined }
export const feedQuery = (f: FeedFilter = {}) => infiniteQueryOptions({
 queryKey: ['feed', f.tipo ?? '', f.autor ?? ''],
 queryFn: ({ pageParam }) => getFeed({ data: { cursor: pageParam, ...(f.tipo ? { tipo: f.tipo } : {}), ...(f.autor ? { autor: f.autor } : {}) } }),
 initialPageParam: null as FeedCursor | null,
 getNextPageParam: last => last.nextCursor,
 staleTime: PUBLIC_STALE,
});

export const commentsQuery = (postId: string) => queryOptions({ queryKey: ['comments', postId], queryFn: () => getComments({ data: { postId } }), staleTime: PUBLIC_STALE });
export const eventsQuery = queryOptions({ queryKey: ['events', 'all'], queryFn: () => getEvents({ data: {} }), staleTime: PUBLIC_STALE });
export const upcomingEventsQuery = queryOptions({ queryKey: ['events', 'upcoming'], queryFn: () => getEvents({ data: { upcoming: true, limit: 2 } }), staleTime: PUBLIC_STALE });
export const eventQuery = (id: string) => queryOptions({ queryKey: ['event', id], queryFn: () => getEvent({ data: { id } }), staleTime: PUBLIC_STALE });
export const opportunitiesQuery = queryOptions({ queryKey: ['opportunities'], queryFn: () => getOpportunities(), staleTime: PUBLIC_STALE });
export const profileQuery = (id: string) => queryOptions({ queryKey: ['profile', id], queryFn: () => getProfile({ data: { id } }), staleTime: PUBLIC_STALE });
export interface SearchFilter { q: string; modalidade: string; cidade: string; atuacao: string }
export const searchQuery = (s: SearchFilter) => queryOptions({ queryKey: ['search', s], queryFn: () => searchDirectory({ data: s }), staleTime: PUBLIC_STALE });
