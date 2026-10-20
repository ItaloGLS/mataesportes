import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import hero from "@/assets/hero.jpg";
import { motion, AnimatePresence } from "motion/react";
import { Shell, FadeIn } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Send, Plus, X, Flag, CalendarDays } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { EventoCard } from "@/components/EventoCard";
import { useStore, uploadImage } from "@/lib/store";
import { MODALIDADES, type Post } from "@/lib/data";
import { platformQuery } from "@/lib/queries";
import { LoadError, Missing, SignInPrompt, EmptyState } from "@/components/RouteStates";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  loader: async ({context}) => { await context.queryClient.ensureQueryData(platformQuery); },
  errorComponent: LoadError,
  notFoundComponent: Missing,
  validateSearch: (s:Record<string,unknown>): {tipo?:string;publicar?:boolean} => ({...(typeof s['tipo']==='string'?{tipo:s['tipo']}:{}),...(s['publicar']===true||s['publicar']==='true'?{publicar:true}:{})}),
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
  const { posts, eventos, publicar, me, user, pending } = useStore();
  const {tipo: filtro, publicar: openRequested} = Route.useSearch();
  const navigate = Route.useNavigate();
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<Post["tipo"]>("Treino");
  const [mod, setMod] = useState<string>(MODALIDADES[0] ?? "Corrida");
  const [localOpen, setLocalOpen] = useState(false);
  const composerOpen = localOpen || Boolean(openRequested);
  const setComposerOpen = (open:boolean) => {setLocalOpen(open);if(!open)void navigate({search:filtro?{tipo:filtro}:{}});};
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const lista = filtro ? posts.filter((p) => p.tipo === filtro) : posts;

  return (
    <Shell>
      <section className="sports-cover relative mx-4 overflow-hidden rounded-[20px] bg-primary md:mx-8">
        <motion.img initial={{ scale: 1.025 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }} src={hero} width={1536} height={768} fetchPriority="high" alt="Imagem ilustrativa de ciclistas e corredores numa estrada entre canaviais, inspirada na Mata Sul de Pernambuco" className="sports-cover-image h-64 w-full object-cover md:h-72" />
        <div className="hero-fade absolute inset-0 flex flex-col justify-end p-5 text-primary-foreground md:justify-center md:p-8 lg:p-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold uppercase tracking-widest text-accent">Mata Sul · Pernambuco</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-2 max-w-md font-display text-4xl font-extrabold uppercase leading-none md:text-5xl">Seu talento<br /><span className="text-accent">merece ser visto.</span></motion.h1>
        </div>
      </section>

      <div className="grid gap-8 px-4 py-8 md:grid-cols-[minmax(0,1fr)_260px] md:px-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0">
          <div className="mobile-heading flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-4"><h2 className="text-3xl font-extrabold uppercase">Da nossa região</h2>{user ? <Button onClick={() => setComposerOpen(!composerOpen)} aria-expanded={composerOpen} className="touch-control rounded-sm bg-accent font-bold text-accent-foreground shadow-none hover:bg-accent/80">{composerOpen ? <X /> : <Plus />} {composerOpen ? "Fechar" : "Novo registro"}</Button> : null}</div>
          <AnimatePresence>{composerOpen && user && <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-b bg-secondary/50" onSubmit={async (e) => { e.preventDefault(); if (!texto.trim() || !me) return; if (!me.cidade) { toast.info('Escolha sua cidade no perfil antes de publicar.'); return; } setUploading(true); try { const path = image ? await uploadImage(image,user.id) : null; const saved = await publicar({ texto: texto.trim(), tipo, modalidade: mod, cidade: me.cidade, image_path:path }); if(saved){setTexto("");setImage(null);void navigate({search:{}});setComposerOpen(false);} } catch { toast.error('Não foi possível publicar. Confira sua imagem e tente novamente.'); } finally { setUploading(false); } }}>
            <div className="space-y-3 p-4"><div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Registro<select aria-label="Tipo de registro" value={tipo} onChange={(e) => setTipo(e.target.value as Post["tipo"])} className="mt-1 block w-full rounded-sm border bg-card px-2 py-2 text-sm">{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label><label className="text-xs font-bold">Modalidade<select aria-label="Modalidade" value={mod} onChange={(e) => setMod(e.target.value)} className="mt-1 block w-full rounded-sm border bg-card px-2 py-2 text-sm">{MODALIDADES.map((m) => <option key={m}>{m}</option>)}</select></label></div>
              <textarea aria-label="Texto do registro" maxLength={5000} value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} placeholder="Como foi o treino? Qual é a próxima conquista?" className="block w-full resize-y rounded-sm border bg-card px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-ring" /><label className="block text-xs font-semibold">Foto<input aria-label="Foto da publicação" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setImage(e.target.files?.[0]??null)} className="mt-2 block w-full text-xs" /></label><div className="flex justify-end"><Button type="submit" disabled={!texto.trim() || pending || uploading}><Send />{uploading?'Publicando…':`Publicar ${tipo.toLowerCase()}`}</Button></div></div>
          </motion.form>}</AnimatePresence>

          <div className="mobile-tab-edge relative"><div className="scroll-quiet flex gap-2 overflow-x-auto py-3 md:gap-2" aria-label="Filtros do feed">
            {[undefined, ...TIPOS].map((t) => <Button key={t ?? "tudo"} variant="ghost" aria-pressed={filtro === t} onClick={() => void navigate({search:t?{tipo:t}:{}})} className={`relative h-11 shrink-0 rounded-full px-4 text-xs font-semibold md:px-4 ${filtro === t ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "border border-border bg-background text-foreground hover:bg-secondary"}`}>{t ? `${t}s` : "Tudo"}</Button>)}
          </div></div>
          <AnimatePresence mode="popLayout">{lista.map((p, i) => <FadeIn key={p.id} i={i}><PostCard post={p} /></FadeIn>)}</AnimatePresence>
          {!lista.length && <div className="mt-5"><EmptyState icon={Flag} title={filtro ? "Nenhum registro por aqui ainda." : "O próximo treino merece aparecer aqui."} action={user ? <Button variant="outline" className="touch-control" onClick={()=>setComposerOpen(true)}>Publicar registro<ArrowUpRight /></Button> : <Button variant="outline" className="touch-control md:hidden" asChild><Link to="/auth">Entrar na conta<ArrowUpRight /></Link></Button>} /></div>}
          {!user && lista.length>0 && <div className="py-5 md:hidden"><SignInPrompt /></div>}
        </div>

        <aside className="min-w-0">
          <div className="mobile-heading flex items-center justify-between border-b-2 border-primary pb-4">
            <h2 className="text-2xl font-bold uppercase">Na agenda</h2>
            <Link to="/eventos" className="flex items-center gap-1 text-xs font-semibold text-foreground">Ver todas<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          {eventos.slice(0, 2).map((e, i) => <FadeIn key={e.id} i={i + 2}><EventoCard e={e} /></FadeIn>)}
          {!eventos.length && <div className="mt-4"><EmptyState icon={CalendarDays} title="Nenhum evento na agenda ainda." action={user ? <Button variant="outline" className="touch-control" asChild><Link to="/eventos">Criar evento<ArrowUpRight /></Link></Button> : undefined} /></div>}
        </aside>
      </div>
    </Shell>
  );
}
