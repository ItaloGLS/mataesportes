import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { formatData, type Evento } from "@/lib/data";

export function EventoCard({ e }: { e: Evento }) {
  const [dia, mes] = formatData(e.data).split(" de ");
  const pct = Math.min(100, Math.round((e.inscritos / e.vagas) * 100));
  return (
    <Link to="/eventos/$id" params={{ id: e.id }} className="card-surface flex gap-4 p-4 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary py-2 text-primary-foreground">
        <span className="font-display text-2xl font-extrabold leading-none text-highlight">{dia}</span>
        <span className="text-xs uppercase">{mes?.replace(".", "")}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-highlight">{e.modalidade}</p>
        <h3 className="truncate text-lg font-bold">{e.nome}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {e.cidade} · {e.valor}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-sport transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{e.inscritos}/{e.vagas} inscritos</p>
      </div>
    </Link>
  );
}
