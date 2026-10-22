ALTER TABLE public.posts ADD COLUMN likes_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN comments_count integer NOT NULL DEFAULT 0;

UPDATE public.posts p SET
  likes_count = (SELECT count(*) FROM public.likes l WHERE l.post_id = p.id),
  comments_count = (SELECT count(*) FROM public.comments c WHERE c.post_id = p.id);

CREATE OR REPLACE FUNCTION public.sync_post_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE public.posts SET likes_count = greatest(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  ELSE
    IF TG_OP = 'INSERT' THEN
      UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE public.posts SET comments_count = greatest(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_post_counters() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_post_counters() FROM anon, authenticated;

CREATE TRIGGER likes_counter AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_counters();
CREATE TRIGGER comments_counter AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_counters();

-- Counters are maintained only by the triggers: users may write content columns only.
REVOKE INSERT, UPDATE ON public.posts FROM authenticated;
GRANT INSERT (autor, tipo, texto, modalidade, cidade, image_path) ON public.posts TO authenticated;
GRANT UPDATE (tipo, texto, modalidade, cidade, image_path) ON public.posts TO authenticated;

CREATE INDEX posts_feed_idx ON public.posts (created_at DESC, id DESC);
CREATE INDEX posts_type_feed_idx ON public.posts (tipo, created_at DESC, id DESC);
CREATE INDEX posts_author_feed_idx ON public.posts (autor, created_at DESC, id DESC);
CREATE INDEX likes_user_idx ON public.likes (user_id, post_id);
CREATE INDEX oportunidades_created_idx ON public.oportunidades (created_at DESC, id DESC);