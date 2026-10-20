import { Link } from "@tanstack/react-router";
import { MapPin, ArrowUpRight } from "lucide-react";
import { formatData, type Evento } from "@/lib/data";

export function EventoCard({ e }: { e: Evento }) {
  const [dia, mes] = formatData(e.data).split(" de ");
  const encerrado = e.encerrado || e.data < new Date().toLocaleDateString('en-CA');
  const abertas = !encerrado && e.inscritos < e.vagas;
  const campeao = e.encerrado ? [...e.resultado].sort((a, b) => a.posicao - b.posicao)[0] : undefined;
  const pct = e.vagas > 0 ? Math.min(100, Math.round((e.inscritos / e.vagas) * 100)) : 0;
  return (
    <Link to="/eventos/$id" params={{ id: e.id }} className="mobile-event group flex items-start gap-3 border-b py-5 transition hover:bg-secondary/40">
      <div className="mobile-date flex w-14 shrink-0 flex-col items-center justify-center rounded-sm bg-primary py-3 text-primary-foreground">
        <span className="font-display text-3xl font-extrabold leading-none text-accent">{dia}</span>
        <span className="text-xs uppercase">{mes?.replace(".", "")}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{e.modalidade}</p>
          {abertas && <span className="rounded-sm bg-seal px-1.5 py-0.5 text-[9px] font-bold uppercase text-seal-foreground">Inscrições abertas</span>}
          {encerrado && <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">Encerrado</span>}
        </div>
        <h3 className="mt-1 text-2xl font-bold leading-tight">{e.nome}</h3>
        <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {e.cidade}{e.horario && ` · ${e.horario}`} · <span className="font-display text-base font-bold text-foreground">{e.valor}</span></p>
        {campeao && <p className="mt-2 text-sm"><span className="font-bold">🏆 1º {campeao.nome}</span>{campeao.marca && <span className="text-muted-foreground"> · {campeao.marca}</span>}</p>}
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border"><div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} /></div>
          <p className="mt-1.5 text-xs text-muted-foreground"><span className="font-display text-lg font-semibold text-foreground">{e.inscritos}</span> / {e.vagas} inscritos</p>
        </div>
      </div>
      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
    </Link>
  );
}
