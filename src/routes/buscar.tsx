import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Shell, Chip, Avatar, FadeIn } from "@/components/Shell";
import { EventoCard } from "@/components/EventoCard";
import { useStore } from "@/lib/store";
import { CIDADES, MODALIDADES, USERS, type Role } from "@/lib/data";

export const Route = createFileRoute("/buscar")({
  head: () => ({
    meta: [
      { title: "Buscar atletas e eventos — Mata Esportes" },
      { name: "description", content: "Encontre atletas, treinadores, olheiros e provas por modalidade e cidade da Mata Sul." },
      { property: "og:title", content: "Buscar na Mata Esportes" },
      { property: "og:description", content: "Filtros por modalidade e cidade da Mata Sul de Pernambuco." },
    ],
  }),
  component: Buscar,
});

function Buscar() {
  const { eventos } = useStore();
  const [q, setQ] = useState("");
  const [mod, setMod] = useState<string | null>(null);
  const [cid, setCid] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const t = q.toLowerCase();

  const pessoas = USERS.filter((u) =>
    (!mod || u.modalidades.includes(mod)) && (!cid || u.cidade === cid) && (!role || u.role === role) &&
    (!t || u.nome.toLowerCase().includes(t) || u.bio.toLowerCase().includes(t)));
  const evs = eventos.filter((e) =>
    (!mod || e.modalidade === mod) && (!cid || e.cidade === cid) && (!t || e.nome.toLowerCase().includes(t)));

  return (
    <Shell>
      <div className="space-y-4 px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-3xl font-extrabold">Buscar</h1>
        <label className="card-surface flex items-center gap-3 px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Atletas, treinadores, provas…" className="flex-1 bg-transparent outline-none" />
        </label>
        <Filtro label="Modalidade" itens={MODALIDADES} valor={mod} set={setMod} />
        <Filtro label="Cidade" itens={CIDADES} valor={cid} set={setCid} />
        <Filtro label="Perfil" itens={["Atleta", "Treinador", "Olheiro"]} valor={role} set={(v) => setRole(v as Role | null)} />

        <h2 className="pt-2 text-xl font-bold">Pessoas <span className="text-muted-foreground">({pessoas.length})</span></h2>
        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence mode="popLayout">{pessoas.map((u, i) => (
            <FadeIn key={u.id} i={i}><Link to="/perfil/$id" params={{ id: u.id }} className="card-surface flex items-center gap-3 p-4 transition hover:-translate-y-0.5">
              <Avatar iniciais={u.iniciais} />
              <div className="min-w-0">
                <p className="font-bold">{u.nome}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">{u.role} · <MapPin className="h-3 w-3" />{u.cidade}</p>
                <p className="text-xs font-semibold text-highlight">{u.modalidades.join(" · ")}</p>
              </div>
            </Link></FadeIn>
          ))}</AnimatePresence>
        </div>
        <h2 className="pt-2 text-xl font-bold">Eventos <span className="text-muted-foreground">({evs.length})</span></h2>
        <div className="grid gap-3 md:grid-cols-2"><AnimatePresence mode="popLayout">{evs.map((e, i) => <FadeIn key={e.id} i={i}><EventoCard e={e} /></FadeIn>)}</AnimatePresence></div>
      </div>
    </Shell>
  );
}

function Filtro({ label, itens, valor, set }: { label: string; itens: string[]; valor: string | null; set: (v: string | null) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {itens.map((i) => <Chip key={i} active={valor === i} onClick={() => set(valor === i ? null : i)}>{i}</Chip>)}
      </div>
    </div>
  );
}
