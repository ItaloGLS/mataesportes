import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import hero from "@/assets/hero.jpg";
import { motion, AnimatePresence } from "motion/react";
import { Shell, FadeIn } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Send, Plus, X } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { EventoCard } from "@/components/EventoCard";
import { useStore, uploadImage } from "@/lib/store";
import { MODALIDADES, type Post } from "@/lib/data";
import { platformQuery } from "@/lib/queries";
import { LoadError, Missing, SignInPrompt } from "@/components/RouteStates";
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
      <section className="relative overflow-hidden md:mx-8">
        <motion.img initial={{ scale: 1.04 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }} src={hero} width={1600} height={800} fetchPriority="high" alt="Atletas em estrada da Mata Sul" className="h-48 w-full object-cover md:h-56" />
        <div className="hero-fade absolute inset-0 flex flex-col justify-center p-6 text-primary-foreground md:p-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold uppercase tracking-widest text-accent">Mata Sul · Pernambuco</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-3 max-w-lg font-display text-4xl font-extrabold uppercase leading-none md:text-6xl"><span className="md:hidden">Seu talento<br />merece ser visto</span><span className="hidden md:inline">Mata Esportes</span></motion.h1>
        </div>
        <div className="race-stripe absolute inset-x-0 bottom-0 hidden h-1.5 md:block" />
      </section>

      <div className="grid gap-8 px-4 py-7 md:grid-cols-[minmax(0,1fr)_260px] md:px-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0">
          <div className="mobile-heading flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-4"><h2 className="text-3xl font-extrabold uppercase">Da nossa região</h2>{user ? <Button onClick={() => setComposerOpen(!composerOpen)} aria-expanded={composerOpen} className="touch-control rounded-sm bg-accent font-bold text-accent-foreground shadow-none hover:bg-accent/80">{composerOpen ? <X /> : <Plus />} {composerOpen ? "Fechar" : "Novo registro"}</Button> : <div className="hidden md:block"><SignInPrompt /></div>}</div>
          <AnimatePresence>{composerOpen && user && <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-b bg-secondary/50" onSubmit={async (e) => { e.preventDefault(); if (!texto.trim() || !me) return; if (!me.cidade) { toast.info('Escolha sua cidade no perfil antes de publicar.'); return; } setUploading(true); try { const path = image ? await uploadImage(image,user.id) : null; const saved = await publicar({ texto: texto.trim(), tipo, modalidade: mod, cidade: me.cidade, image_path:path }); if(saved){setTexto("");setImage(null);void navigate({search:{}});setComposerOpen(false);} } catch { toast.error('Não foi possível publicar. Confira sua imagem e tente novamente.'); } finally { setUploading(false); } }}>
            <div className="space-y-3 p-4"><div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Registro<select aria-label="Tipo de registro" value={tipo} onChange={(e) => setTipo(e.target.value as Post["tipo"])} className="mt-1 block w-full rounded-sm border bg-card px-2 py-2 text-sm">{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label><label className="text-xs font-bold">Modalidade<select aria-label="Modalidade" value={mod} onChange={(e) => setMod(e.target.value)} className="mt-1 block w-full rounded-sm border bg-card px-2 py-2 text-sm">{MODALIDADES.map((m) => <option key={m}>{m}</option>)}</select></label></div>
              <textarea aria-label="Texto do registro" maxLength={5000} value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} placeholder="Como foi o treino? Qual é a próxima conquista?" className="block w-full resize-y rounded-sm border bg-card px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-ring" /><label className="block text-xs font-semibold">Foto<input aria-label="Foto da publicação" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setImage(e.target.files?.[0]??null)} className="mt-2 block w-full text-xs" /></label><div className="flex justify-end"><Button type="submit" disabled={!texto.trim() || pending || uploading}><Send />{uploading?'Publicando…':`Publicar ${tipo.toLowerCase()}`}</Button></div></div>
          </motion.form>}</AnimatePresence>

          <div className="mobile-tab-edge relative"><div className="scroll-quiet flex gap-2 overflow-x-auto py-3 md:gap-1 md:border-b md:py-2" aria-label="Filtros do feed">
            {[undefined, ...TIPOS].map((t) => <Button key={t ?? "tudo"} variant="ghost" aria-pressed={filtro === t} onClick={() => void navigate({search:t?{tipo:t}:{}})} className={`relative h-11 shrink-0 rounded-full px-4 text-xs font-semibold md:h-9 md:rounded-none md:px-3 md:font-bold ${filtro === t ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground md:bg-transparent md:text-foreground md:after:absolute md:after:inset-x-3 md:after:bottom-0 md:after:h-0.5 md:after:bg-primary md:hover:bg-transparent md:hover:text-foreground" : "bg-secondary text-secondary-foreground md:bg-transparent md:text-muted-foreground"}`}>{t ? `${t}s` : "Tudo"}</Button>)}
          </div></div>
          <AnimatePresence mode="popLayout">{lista.map((p, i) => <FadeIn key={p.id} i={i}><PostCard post={p} /></FadeIn>)}</AnimatePresence>
          {!lista.length && <div className="space-y-4 py-9"><div className="grid h-14 w-14 place-items-center rounded-touch bg-accent/20 text-foreground"><Plus className="h-7 w-7" /></div><h3 className="max-w-xs text-3xl font-bold">Seja o primeiro a mostrar seu treino</h3>{user ? <Button className="touch-control mobile-primary" onClick={()=>setComposerOpen(true)}>Publicar registro</Button> : <SignInPrompt />}</div>}
          {!user && lista.length>0 && <div className="py-5 md:hidden"><SignInPrompt /></div>}
        </div>

        <aside className="min-w-0">
          <div className="mobile-heading flex items-center justify-between border-b-2 border-primary pb-4">
            <h2 className="text-2xl font-bold uppercase">Na agenda</h2>
            <Link to="/eventos" className="flex items-center gap-1 text-xs font-semibold text-foreground">Ver todas<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          {eventos.slice(0, 2).map((e, i) => <FadeIn key={e.id} i={i + 2}><EventoCard e={e} /></FadeIn>)}
          {!eventos.length && <p className="py-6 text-sm text-muted-foreground">Nenhum evento publicado.</p>}
        </aside>
      </div>
    </Shell>
  );
}
