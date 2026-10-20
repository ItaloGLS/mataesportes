import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, Ticket, Users, Check } from "lucide-react";
import { motion } from "motion/react";
import { Shell, Avatar } from "@/components/Shell";
import { useStore } from "@/lib/store";
import { userById } from "@/lib/data";

export const Route = createFileRoute("/eventos/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do evento — Mata Esportes" },
      { name: "description", content: "Informações da prova, categorias e inscrição." },
      { property: "og:title", content: "Evento — Mata Esportes" },
      { property: "og:description", content: "Detalhes e inscrição em competição da Mata Sul." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Detalhe,
});

function Detalhe() {
  const { id } = Route.useParams();
  const { eventos, inscricoes, inscrever } = useStore();
  const e = eventos.find((x) => x.id === id);
  if (!e) return <Shell><p className="p-8">Evento não encontrado.</p></Shell>;
  const org = userById(e.organizador)!;
  const inscrito = inscricoes.has(e.id);
  const lotado = e.inscritos >= e.vagas;
  const data = new Date(e.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <Shell>
      <div className="space-y-5 px-4 py-6 md:px-8 md:py-8">
        <Link to="/eventos" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Eventos</Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-primary p-6 text-primary-foreground md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-accent">{e.modalidade}</p>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{e.nome}</h1>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <p className="flex items-center gap-2 capitalize"><CalendarDays className="h-4 w-4 text-accent" /> {data}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> {e.local}, {e.cidade}</p>
            <p className="flex items-center gap-2"><Ticket className="h-4 w-4 text-accent" /> {e.valor}</p>
            <p className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" /> {e.inscritos} de {e.vagas} vagas</p>
          </div>
        </motion.div>
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="card-surface space-y-4 p-6">
            <h2 className="text-xl font-bold">Sobre a prova</h2>
            <p className="leading-relaxed text-muted-foreground">{e.descricao}</p>
            <h3 className="font-bold">Categorias</h3>
            <div className="flex flex-wrap gap-2">{e.categorias.map((c) => <span key={c} className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">{c}</span>)}</div>
          </div>
          <div className="space-y-4">
            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} disabled={inscrito || lotado} onClick={() => inscrever(e.id)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-highlight py-4 text-lg font-bold text-highlight-foreground transition disabled:bg-accent disabled:text-accent-foreground">
              {inscrito ? <><Check className="h-5 w-5" /> Inscrição confirmada</> : lotado ? "Vagas esgotadas" : "Inscrever-se"}
            </motion.button>
            <Link to="/perfil/$id" params={{ id: org.id }} className="card-surface flex items-center gap-3 p-4">
              <Avatar iniciais={org.iniciais} />
              <div><p className="text-xs text-muted-foreground">Organização</p><p className="font-bold">{org.nome}</p></div>
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
