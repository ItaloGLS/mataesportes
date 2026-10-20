import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Shell, Chip, FadeIn } from "@/components/Shell";
import { EventoCard } from "@/components/EventoCard";
import { useStore } from "@/lib/store";
import { CIDADES, MODALIDADES } from "@/lib/data";

export const Route = createFileRoute("/eventos/")({
  head: () => ({
    meta: [
      { title: "Eventos e competições — Mata Esportes" },
      { name: "description", content: "Corridas, pedais, torneios e travessias na Mata Sul de Pernambuco. Inscreva-se." },
      { property: "og:title", content: "Eventos esportivos da Mata Sul" },
      { property: "og:description", content: "Calendário de competições regionais com inscrição online." },
    ],
  }),
  component: Eventos,
});

const input = "w-full rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring";

function Eventos() {
  const { eventos, criarEvento } = useStore();
  const [mod, setMod] = useState<string | null>(null);
  const [form, setForm] = useState(false);
  const lista = mod ? eventos.filter((e) => e.modalidade === mod) : eventos;

  return (
    <Shell>
      <div className="space-y-5 px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-highlight">Calendário</p>
            <h1 className="text-3xl font-extrabold">Competições regionais</h1>
          </div>
          <button onClick={() => setForm(!form)} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            {form ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {form ? "Fechar" : "Criar evento"}
          </button>
        </div>

        {form && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="card-surface grid overflow-hidden gap-3 p-5 md:grid-cols-2" onSubmit={(ev) => {
            ev.preventDefault();
            const f = new FormData(ev.currentTarget);
            criarEvento({
              nome: String(f.get("nome")), modalidade: String(f.get("modalidade")), cidade: String(f.get("cidade")),
              data: String(f.get("data")), local: String(f.get("local")), vagas: Number(f.get("vagas")),
              valor: String(f.get("valor")) || "Gratuito", descricao: String(f.get("descricao")),
              categorias: String(f.get("categorias")).split(",").map((s) => s.trim()).filter(Boolean),
            });
            setForm(false);
          }}>
            <input name="nome" required placeholder="Nome do evento" className={`${input} md:col-span-2`} />
            <select name="modalidade" className={input}>{MODALIDADES.map((m) => <option key={m}>{m}</option>)}</select>
            <select name="cidade" className={input}>{CIDADES.map((c) => <option key={c}>{c}</option>)}</select>
            <input name="data" type="date" required className={input} />
            <input name="local" required placeholder="Local" className={input} />
            <input name="vagas" type="number" min={1} required placeholder="Vagas" className={input} />
            <input name="valor" placeholder="Valor (ex: R$ 50)" className={input} />
            <input name="categorias" placeholder="Categorias separadas por vírgula" className={`${input} md:col-span-2`} />
            <textarea name="descricao" rows={3} placeholder="Detalhes da prova" className={`${input} md:col-span-2`} />
            <button className="rounded-full bg-highlight py-2.5 font-bold text-highlight-foreground md:col-span-2">Publicar evento</button>
          </motion.form>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip active={!mod} onClick={() => setMod(null)}>Todas</Chip>
          {MODALIDADES.map((m) => <Chip key={m} active={mod === m} onClick={() => setMod(m)}>{m}</Chip>)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">{lista.map((e, i) => <FadeIn key={e.id} i={i}><EventoCard e={e} /></FadeIn>)}</AnimatePresence>
        </div>
        {!lista.length && <p className="py-10 text-center text-muted-foreground">Nenhum evento nessa modalidade ainda. Que tal criar um?</p>}
      </div>
    </Shell>
  );
}
