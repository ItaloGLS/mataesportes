import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Trophy, Timer, Medal } from "lucide-react";
import { Shell, Avatar } from "@/components/Shell";
import { PostCard } from "@/components/PostCard";
import { useStore, ME } from "@/lib/store";
import { userById } from "@/lib/data";

export const Route = createFileRoute("/perfil/$id")({
  head: () => ({
    meta: [
      { title: "Currículo esportivo — Mata Esportes" },
      { name: "description", content: "Pódios, marcas, modalidades e biografia de atletas da Mata Sul." },
      { property: "og:title", content: "Perfil — Mata Esportes" },
      { property: "og:description", content: "Currículo esportivo na rede da Mata Sul de Pernambuco." },
    ],
  }),
  component: Perfil,
});

const MEDALHA = { 1: "bg-highlight text-highlight-foreground", 2: "bg-muted text-foreground", 3: "bg-secondary text-secondary-foreground" } as const;

function Perfil() {
  const { id } = Route.useParams();
  const { posts } = useStore();
  const [seguindo, setSeguindo] = useState(false);
  const u = userById(id);
  if (!u) return <Shell><p className="p-8">Perfil não encontrado.</p></Shell>;
  const meus = posts.filter((p) => p.autor === u.id);
  const ouros = u.podios.filter((p) => p.posicao === 1).length;

  return (
    <Shell>
      <div className="space-y-5 px-4 py-6 md:px-8 md:py-8">
        <section className="card-surface overflow-hidden">
          <div className="h-24 bg-primary" />
          <div className="-mt-12 flex flex-col gap-4 p-6 pt-0 sm:flex-row sm:items-end">
            <Avatar iniciais={u.iniciais} size="lg" />
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold">{u.nome}</h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">{u.role} · {u.idade} anos · <MapPin className="h-3.5 w-3.5" /> {u.cidade}, PE</p>
            </div>
            {u.id !== ME && (
              <button onClick={() => setSeguindo(!seguindo)} className={`rounded-full px-5 py-2 text-sm font-bold ${seguindo ? "border bg-card" : "bg-primary text-primary-foreground"}`}>
                {seguindo ? "Seguindo" : "Seguir"}
              </button>
            )}
          </div>
          <div className="px-6 pb-6">
            <p className="leading-relaxed">{u.bio}</p>
            <div className="mt-3 flex flex-wrap gap-2">{u.modalidades.map((m) => <span key={m} className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">{m}</span>)}</div>
          </div>
          <div className="grid grid-cols-3 border-t text-center">
            {[["Pódios", u.podios.length], ["Títulos", ouros], ["Posts", meus.length]].map(([l, v]) => (
              <div key={l} className="py-4"><p className="font-display text-2xl font-extrabold text-primary">{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="card-surface p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Trophy className="h-5 w-5 text-highlight" /> Histórico de pódios</h2>
            <ul className="mt-4 space-y-3">
              {u.podios.map((p) => (
                <li key={p.titulo} className="flex items-center gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display font-extrabold ${MEDALHA[p.posicao]}`}>{p.posicao}º</span>
                  <div><p className="font-semibold">{p.titulo}</p><p className="text-xs text-muted-foreground">{p.ano}</p></div>
                </li>
              ))}
              {!u.podios.length && <p className="text-sm text-muted-foreground">Sem pódios registrados.</p>}
            </ul>
          </section>
          <section className="card-surface p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Timer className="h-5 w-5 text-highlight" /> Tempos e marcas</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {u.marcas.map((m) => (
                <div key={m.prova} className="rounded-xl bg-muted p-3">
                  <p className="text-xs font-semibold text-muted-foreground">{m.prova}</p>
                  <p className="font-display text-2xl font-extrabold text-primary">{m.valor}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <h2 className="flex items-center gap-2 text-lg font-bold"><Medal className="h-5 w-5 text-highlight" /> Publicações</h2>
        <div className="space-y-4">{meus.map((p) => <PostCard key={p.id} post={p} />)}</div>
      </div>
    </Shell>
  );
}
