import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { feedQuery, type FeedFilter } from '@/lib/queries';
import { useLikedPosts } from '@/lib/store';
import { PostCard } from './PostCard';
import { FadeIn } from './Shell';
import { Button } from './ui/button';

/** Paginated feed: 15 posts per page, next page loads as the reader nears the end. */
export function FeedList({ filter, empty, footer }: { filter: FeedFilter; empty: ReactNode; footer?: ReactNode }) {
  const feed = useSuspenseInfiniteQuery(feedQuery(filter));
  const posts = feed.data.pages.flatMap((p) => p.posts);
  const liked = useLikedPosts(feed.data.pages);
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = feed;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !isFetchingNextPage) void fetchNextPage();
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!posts.length) return <>{empty}</>;
  return (
    <>
      <AnimatePresence mode="popLayout">{posts.map((p, i) => <FadeIn key={p.id} i={i % 15}><PostCard post={p} liked={liked.has(p.id)} /></FadeIn>)}</AnimatePresence>
      <div ref={sentinel} aria-hidden className="h-px" />
      {isFetchingNextPage && <p role="status" className="py-5 text-center text-sm text-muted-foreground">Carregando mais…</p>}
      {feed.isFetchNextPageError && <div className="py-5 text-center"><Button variant="outline" onClick={() => void fetchNextPage()}>Tentar carregar mais</Button></div>}
      {!hasNextPage && footer}
    </>
  );
}
