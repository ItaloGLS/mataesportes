import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import hero from "@/assets/hero.jpg";
import { motion, AnimatePresence } from "motion/react";
import { Shell, FadeIn } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Send, Plus, X } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { EventoCard } from "@/components/EventoCard";
import { useStore, ME } from "@/lib/store";
import { MODALIDADES, userById, type Post } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mata Esportes — Rede social esportiva da Mata Sul de PE" },
      { name: "description", content: "Feed, peneiras, competições e currículos esportivos de atletas da Mata Sul de Pernambuco." },
      { property: "og:title", content: "Mata Esportes" },
      { property: "og:description", content: "Conectando atletas, treinadores e olheiros da Mata Sul de Pernambuco." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Feed,
});

const TIPOS: Post["tipo"][] = ["Conquista", "Treino", "Peneira", "Notícia"];

function Feed() {
  const { posts, eventos, publicar } = useStore();
  const [filtro, setFiltro] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<Post["tipo"]>("Treino");
  const [mod, setMod] = useState<string>(MODALIDADES[0] ?? "Corrida");
  const [composerOpen, setComposerOpen] = useState(false);
  const me = userById(ME);
  if (!me) return null;
  const lista = filtro ? posts.filter((p) => p.tipo === filtro) : posts;

  return (
    <Shell>
      <section className="relative overflow-hidden md:mx-8">
        <motion.img initial={{ scale: 1.04 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }} src={hero} width={1600} height={800} fetchPriority="high" alt="Atletas em estrada da Mata Sul" className="h-48 w-full object-cover md:h-56" />
        <div className="hero-fade absolute inset-0 flex flex-col justify-center p-6 text-primary-foreground md:p-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold uppercase tracking-widest text-accent">Mata Sul · Pernambuco</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-3 max-w-lg font-display text-5xl font-extrabold uppercase leading-none md:text-6xl">Mata Esportes</motion.h1>
        </div>
        <div className="race-stripe absolute inset-x-0 bottom-0 h-1.5" />
      </section>

      <div className="grid gap-8 px-4 py-7 md:grid-cols-[minmax(0,1fr)_260px] md:px-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-4"><h2 className="text-3xl font-extrabold uppercase">Da nossa região</h2><Button onClick={() => setComposerOpen(!composerOpen)} aria-expanded={composerOpen} className="rounded-sm bg-accent font-bold text-accent-foreground shadow-none hover:bg-accent/80">{composerOpen ? <X /> : <Plus />} {composerOpen ? "Fechar" : "Novo registro"}</Button></div>
          <AnimatePresence>{composerOpen && <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-b bg-secondary/50" onSubmit={(e) => { e.preventDefault(); if (!texto.trim()) return; publicar({ texto: texto.trim(), tipo, modalidade: mod, cidade: me.cidade }); setTexto(""); setFiltro(null); setComposerOpen(false); }}>
            <div className="space-y-3 p-4"><div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Registro<select aria-label="Tipo de registro" value={tipo} onChange={(e) => setTipo(e.target.value as Post["tipo"])} className="mt-1 block w-full rounded-sm border bg-card px-2 py-2 text-sm">{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label><label className="text-xs font-bold">Modalidade<select aria-label="Modalidade" value={mod} onChange={(e) => setMod(e.target.value)} className="mt-1 block w-full rounded-sm border bg-card px-2 py-2 text-sm">{MODALIDADES.map((m) => <option key={m}>{m}</option>)}</select></label></div>
              <textarea aria-label="Texto do registro" value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} placeholder="Como foi o treino? Qual é a próxima conquista?" className="block w-full resize-y rounded-sm border bg-card px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-ring" /><div className="flex justify-end"><Button type="submit" disabled={!texto.trim()}><Send />Publicar {tipo.toLowerCase()}</Button></div></div>
          </motion.form>}</AnimatePresence>

          <div className="flex gap-1 overflow-x-auto border-b py-2" aria-label="Filtros do feed">
            {[null, ...TIPOS].map((t) => <Button key={t ?? "tudo"} variant="ghost" aria-pressed={filtro === t} onClick={() => setFiltro(t)} className={`relative shrink-0 rounded-none px-3 text-xs font-bold hover:bg-transparent ${filtro === t ? "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary" : "text-muted-foreground"}`}>{t ? `${t}s` : "Tudo"}</Button>)}
          </div>
          <AnimatePresence mode="popLayout">{lista.map((p, i) => <FadeIn key={p.id} i={i}><PostCard post={p} /></FadeIn>)}</AnimatePresence>
        </div>

        <aside className="min-w-0">
          <div className="flex items-center justify-between border-b-2 border-primary pb-4">
            <h2 className="text-2xl font-bold uppercase">Na agenda</h2>
            <Link to="/eventos" className="flex items-center gap-1 text-xs font-semibold text-foreground">Ver todas<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          {eventos.slice(0, 2).map((e, i) => <FadeIn key={e.id} i={i + 2}><EventoCard e={e} /></FadeIn>)}
        </aside>
      </div>
    </Shell>
  );
}
