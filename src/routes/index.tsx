import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import hero from "@/assets/hero.jpg";
import { motion, AnimatePresence } from "motion/react";
import { Shell, Chip, Avatar, FadeIn } from "@/components/Shell";
import { PostCard } from "@/components/PostCard";
import { EventoCard } from "@/components/EventoCard";
import { useStore, ME } from "@/lib/store";
import { CIDADES, MODALIDADES, userById, type Post } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mata Esportes — Rede social esportiva da Mata Sul de PE" },
      { name: "description", content: "Feed, peneiras, competições e currículos esportivos de atletas da Mata Sul de Pernambuco." },
      { property: "og:title", content: "Mata Esportes" },
      { property: "og:description", content: "Conectando atletas, treinadores e olheiros da Mata Sul de Pernambuco." },
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
  const [mod, setMod] = useState<string>(MODALIDADES[0]!);
  const me = userById(ME)!;
  const lista = filtro ? posts.filter((p) => p.tipo === filtro) : posts;

  return (
    <Shell>
      <section className="relative mx-4 mt-4 overflow-hidden rounded-3xl md:mx-8 md:mt-8">
        <motion.img initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }} src={hero} width={1600} height={800} fetchPriority="high" alt="Atletas em estrada da Mata Sul" className="h-56 w-full object-cover md:h-72" />
        <div className="hero-fade absolute inset-0 flex flex-col justify-end p-6 text-primary-foreground">
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-sm font-bold uppercase tracking-widest text-highlight">Mata Sul · Pernambuco</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="max-w-lg text-3xl font-extrabold uppercase italic md:text-5xl">Seu talento <span className="text-gradient-sport">merece</span> ser visto.</motion.h1>
        </div>
      </section>

      <div className="grid gap-6 px-4 py-6 md:px-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <form className="card-surface p-4" onSubmit={(e) => { e.preventDefault(); if (!texto.trim()) return; publicar({ texto, tipo, modalidade: mod, cidade: me.cidade }); setTexto(""); }}>
            <div className="flex gap-3">
              <Avatar iniciais={me.iniciais} />
              <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} placeholder="Compartilhe um treino, conquista ou peneira…" className="flex-1 resize-none rounded-xl bg-muted px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {TIPOS.map((t) => <Chip key={t} active={tipo === t} onClick={() => setTipo(t)}>{t}</Chip>)}
              <select value={mod} onChange={(e) => setMod(e.target.value)} className="rounded-full border bg-card px-3 py-1.5 text-sm font-semibold">
                {MODALIDADES.map((m) => <option key={m}>{m}</option>)}
              </select>
              <button className="ml-auto rounded-full bg-gradient-sport transition hover:scale-105 active:scale-95 px-5 py-2 text-sm font-bold text-accent-foreground">Publicar</button>
            </div>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <Chip active={!filtro} onClick={() => setFiltro(null)}>Tudo</Chip>
            {TIPOS.map((t) => <Chip key={t} active={filtro === t} onClick={() => setFiltro(t)}>{t}s</Chip>)}
          </div>
          <AnimatePresence mode="popLayout">{lista.map((p, i) => <FadeIn key={p.id} i={i}><PostCard post={p} /></FadeIn>)}</AnimatePresence>
        </div>

        <aside className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Próximas provas</h2>
            <Link to="/eventos" className="text-sm font-semibold text-highlight">Ver todas</Link>
          </div>
          {eventos.slice(0, 3).map((e, i) => <FadeIn key={e.id} i={i + 2}><EventoCard e={e} /></FadeIn>)}
          <div className="card-surface p-4">
            <h3 className="font-bold">Cidades ativas</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CIDADES.map((c) => <span key={c} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{c}</span>)}
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
