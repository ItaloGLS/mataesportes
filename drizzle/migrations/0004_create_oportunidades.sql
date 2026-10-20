CREATE TABLE public.oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Edital','Bolsa','Processo seletivo')),
  titulo TEXT NOT NULL,
  organizacao TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  cidade TEXT NOT NULL,
  modalidade TEXT,
  link TEXT NOT NULL DEFAULT '',
  prazo DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.oportunidades TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oportunidades TO authenticated;
GRANT ALL ON public.oportunidades TO service_role;
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Oportunidades são públicas" ON public.oportunidades FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Usuário publica oportunidade" ON public.oportunidades FOR INSERT TO authenticated WITH CHECK (auth.uid() = autor);
CREATE POLICY "Autor edita sua oportunidade" ON public.oportunidades FOR UPDATE TO authenticated USING (auth.uid() = autor) WITH CHECK (auth.uid() = autor);
CREATE POLICY "Autor exclui sua oportunidade" ON public.oportunidades FOR DELETE TO authenticated USING (auth.uid() = autor);