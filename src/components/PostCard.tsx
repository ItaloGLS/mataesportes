import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, MapPin, Send } from "lucide-react";
import { userById, type Post } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar } from "./Shell";
import { Button } from "@/components/ui/button";
import pedal from "@/assets/pedal-catende.jpg";

const TIPO_COR: Record<Post["tipo"], string> = {
  Peneira: "bg-accent text-accent-foreground",
  Conquista: "bg-secondary text-secondary-foreground",
  Treino: "bg-secondary text-secondary-foreground",
  Notícia: "bg-secondary text-secondary-foreground",
};

export function PostCard({ post }: { post: Post }) {
  const { liked, toggleLike, comentar } = useStore();
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState("");
  const autor = userById(post.autor);
  if (!autor) return null;
  const isLiked = liked.has(post.id);
  return (
    <article className="border-b border-border bg-card px-4 py-6 sm:px-6">
      <header className="flex items-center gap-3">
        <Avatar iniciais={autor.iniciais} />
        <div className="min-w-0 flex-1">
          <Link to="/perfil/$id" params={{ id: autor.id }} className="font-bold hover:underline">{autor.nome}</Link>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {post.cidade} · {post.tempo}
          </p>
        </div>
        <span className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${TIPO_COR[post.tipo]}`}>{post.tipo}</span>
      </header>
      <p className="mt-4 leading-relaxed">{post.texto}</p>
      {post.id === "p3" && <figure className="mt-4"><img src={pedal} alt="Imagem ilustrativa de ciclistas em treino nas estradas da Mata Sul" loading="lazy" width={1280} height={768} className="aspect-[5/3] w-full rounded-sm object-cover" /><figcaption className="mt-1 text-[10px] text-muted-foreground">Imagem ilustrativa</figcaption></figure>}
      <footer className="mt-4 flex gap-2 border-t pt-3">
        <Button variant="ghost" aria-label="Curtir publicação" aria-pressed={isLiked} onClick={() => toggleLike(post.id)} className={`gap-2 rounded-sm px-2 text-sm font-semibold hover:bg-muted ${isLiked ? "text-foreground bg-accent/30" : "text-muted-foreground"}`}>
          <motion.span key={String(isLiked)} initial={{ scale: isLiked ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}><Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} /></motion.span> {post.likes}
        </Button>
        <Button variant="ghost" aria-label="Comentários" aria-expanded={open} onClick={() => setOpen(!open)} className="gap-2 rounded-sm px-2 text-sm font-semibold text-muted-foreground hover:bg-muted">
          <MessageCircle className="h-4 w-4" /> {post.comentarios.length}
        </Button>
      </footer>
      <AnimatePresence>{open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-3 overflow-hidden">
          {post.comentarios.map((c, i) => {
            const u = userById(c.autor);
            return (
              <div key={i} className="rounded-sm bg-muted px-3 py-2 text-sm">
                <span className="font-bold">{u?.nome ?? "Atleta"}</span> {c.texto}
              </div>
            );
          })}
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (txt.trim()) { comentar(post.id, txt.trim()); setTxt(""); } }}>
            <input aria-label="Comentário" value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Escreva um comentário…" className="min-w-0 flex-1 rounded-sm border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <Button type="submit" size="icon" aria-label="Enviar" disabled={!txt.trim()}><Send className="h-4 w-4" /></Button>
          </form>
        </motion.div>
      )}</AnimatePresence>
    </article>
  );
}
