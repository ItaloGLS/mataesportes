import { Link } from "@tanstack/react-router";
import { MapPin, ArrowUpRight } from "lucide-react";
import { formatData, type Evento } from "@/lib/data";

export function EventoCard({ e }: { e: Evento }) {
  const [dia, mes] = formatData(e.data).split(" de ");
  return (
    <Link to="/eventos/$id" params={{ id: e.id }} className="mobile-event group flex items-start gap-3 border-b py-5 transition hover:bg-secondary/40">
      <div className="mobile-date flex w-14 shrink-0 flex-col items-center justify-center rounded-sm bg-primary py-3 text-primary-foreground">
        <span className="font-display text-3xl font-extrabold leading-none text-accent">{dia}</span>
        <span className="text-xs uppercase">{mes?.replace(".", "")}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{e.modalidade}</p>
        <h3 className="mt-1 text-2xl font-bold leading-tight">{e.nome}</h3>
        <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {e.cidade} · {e.valor}</p>
        <p className="mt-2 text-xs text-muted-foreground"><span className="font-display text-lg font-semibold text-foreground">{e.inscritos}</span> / {e.vagas} inscritos</p>
      </div>
      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
    </Link>
  );
}
