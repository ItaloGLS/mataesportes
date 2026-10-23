-- =============================================================
-- Migration 0010: Seguranca, Menores, Moderacao e Denuncias
-- Idempotente (compativel com estruturas ja ativas no Supabase)
-- =============================================================

-- 1. TABELA DE PAPEIS (user_roles: user, moderator, admin)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'moderator', 'admin')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason     TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Funcao has_role segura (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(uid UUID, p_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = uid AND ur.role = p_role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, service_role, anon;

-- Funcao auxiliar is_staff (admin ou moderator)
CREATE OR REPLACE FUNCTION public.is_staff(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = uid AND ur.role IN ('admin', 'moderator')
  );
$$;

REVOKE ALL ON FUNCTION public.is_staff(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff(UUID) TO authenticated, service_role;

DROP POLICY IF EXISTS user_roles_read ON public.user_roles;
CREATE POLICY user_roles_read ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- 2. DADOS PRIVADOS E MENORES (profile_private)
CREATE TABLE IF NOT EXISTS public.profile_private (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  birthdate     DATE NOT NULL,
  parent_email  TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profile_private TO authenticated;
GRANT ALL ON public.profile_private TO service_role;
ALTER TABLE public.profile_private ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profile_private_owner ON public.profile_private;
CREATE POLICY profile_private_owner ON public.profile_private
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- Campo verificado e age_group em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_minor BOOLEAN NOT NULL DEFAULT false;

-- Grandfathering para treinadores e olheiros preexistentes
UPDATE public.profiles
SET verified = true
WHERE atuacao IN ('Treinador', 'Olheiro') AND verified IS false;

-- Trigger para proteger colunas sensíveis em profiles de edição direta
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se não for admin, impede alteração direta de verified
  IF (OLD.verified IS DISTINCT FROM NEW.verified) THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Apenas administradores podem alterar o status de verificacao';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_fields();

-- 3. SANCOES E RESTRICAO (user_sanctions + is_restricted)
CREATE TABLE IF NOT EXISTS public.user_sanctions (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sanction_type TEXT NOT NULL CHECK (sanction_type IN ('warning', 'suspension', 'ban')),
  reason        TEXT NOT NULL,
  expires_at    TIMESTAMPTZ,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_sanctions TO authenticated;
GRANT ALL ON public.user_sanctions TO service_role;
ALTER TABLE public.user_sanctions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_sanctions_read ON public.user_sanctions;
CREATE POLICY user_sanctions_read ON public.user_sanctions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.is_restricted(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_sanctions
    WHERE user_id = uid
      AND (
        sanction_type = 'ban'
        OR (sanction_type = 'suspension' AND (expires_at IS NULL OR expires_at > now()))
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_restricted(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_restricted(UUID) TO authenticated, service_role, anon;

-- 4. OPORTUNIDADES: APROVACAO E MODERACAO
ALTER TABLE public.oportunidades ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'aprovada' CHECK (status IN ('pendente', 'aprovada', 'rejeitada'));

-- Garante que todas as oportunidades existentes estejam aprovadas
UPDATE public.oportunidades SET status = 'aprovada' WHERE status IS NULL;

-- Atualiza RLS de oportunidades: visitantes e atletas veem apenas aprovadas
DROP POLICY IF EXISTS oportunidades_public_read ON public.oportunidades;
CREATE POLICY oportunidades_public_read ON public.oportunidades
  FOR SELECT TO public
  USING (
    status = 'aprovada'
    OR (auth.uid() IS NOT NULL AND auth.uid() = criado_por)
    OR public.is_staff(auth.uid())
  );

-- 5. DENUNCIAS E AUTO-OCULTACAO (reports)
CREATE TABLE IF NOT EXISTS public.reports (
  id            BIGSERIAL PRIMARY KEY,
  reporter_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type   TEXT NOT NULL CHECK (target_type IN ('post', 'profile', 'opportunity', 'comment')),
  target_id     UUID NOT NULL,
  reason        TEXT NOT NULL CHECK (char_length(reason) >= 3 AND char_length(reason) <= 1000),
  status        TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'analisado', 'descartado')),
  reviewed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_target_report UNIQUE (reporter_id, target_type, target_id)
);

GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reports_insert ON public.reports;
CREATE POLICY reports_insert ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id AND NOT public.is_restricted(auth.uid()));

DROP POLICY IF EXISTS reports_read ON public.reports;
CREATE POLICY reports_read ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR public.is_staff(auth.uid()));

-- Coluna hidden em posts e comentarios para moderacao / auto-ocultacao
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false;

-- Trigger para auto-ocultar post ou comentario apos 3 denuncias distintas
CREATE OR REPLACE FUNCTION public.check_auto_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_count INT;
BEGIN
  IF NEW.target_type = 'post' THEN
    SELECT COUNT(DISTINCT reporter_id) INTO report_count
    FROM public.reports
    WHERE target_type = 'post' AND target_id = NEW.target_id;

    IF report_count >= 3 THEN
      UPDATE public.posts SET hidden = true WHERE id = NEW.target_id;
    END IF;
  ELSIF NEW.target_type = 'comment' THEN
    SELECT COUNT(DISTINCT reporter_id) INTO report_count
    FROM public.reports
    WHERE target_type = 'comment' AND target_id = NEW.target_id;

    IF report_count >= 3 THEN
      UPDATE public.comments SET hidden = true WHERE id = NEW.target_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_moderation ON public.reports;
CREATE TRIGGER trg_auto_moderation
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.check_auto_moderation();
