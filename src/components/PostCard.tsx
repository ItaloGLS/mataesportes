import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, MapPin, Send } from "lucide-react";
import { userById, type Post } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar } from "./Shell";

const TIPO_COR: Record<Post["tipo"], string> = {
  Peneira: "bg-highlight text-highlight-foreground",
  Conquista: "bg-accent text-accent-foreground",
  Treino: "bg-secondary text-secondary-foreground",
  Notícia: "bg-primary text-primary-foreground",
};

export function PostCard({ post }: { post: Post }) {
  const { liked, toggleLike, comentar } = useStore();
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState("");
  const autor = userById(post.autor)!;
  const isLiked = liked.has(post.id);
  return (
    <article className="card-surface p-5">
      <header className="flex items-center gap-3">
        <Avatar iniciais={autor.iniciais} />
        <div className="min-w-0 flex-1">
          <Link to="/perfil/$id" params={{ id: autor.id }} className="font-bold hover:underline">{autor.nome}</Link>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {autor.role} · <MapPin className="h-3 w-3" /> {post.cidade} · {post.tempo}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${TIPO_COR[post.tipo]}`}>{post.tipo}</span>
      </header>
      <p className="mt-4 leading-relaxed">{post.texto}</p>
      <p className="mt-3 text-xs font-semibold text-muted-foreground">#{post.modalidade.toLowerCase()}</p>
      <footer className="mt-4 flex gap-2 border-t pt-3">
        <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-muted ${isLiked ? "text-highlight" : "text-muted-foreground"}`}>
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} /> {post.likes}
        </button>
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-muted">
          <MessageCircle className="h-4 w-4" /> {post.comentarios.length}
        </button>
      </footer>
      {open && (
        <div className="mt-3 space-y-3">
          {post.comentarios.map((c, i) => {
            const u = userById(c.autor)!;
            return (
              <div key={i} className="rounded-xl bg-muted px-3 py-2 text-sm">
                <span className="font-bold">{u.nome}</span> {c.texto}
              </div>
            );
          })}
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (txt.trim()) { comentar(post.id, txt.trim()); setTxt(""); } }}>
            <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Escreva um comentário…" className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button aria-label="Enviar" className="rounded-xl bg-primary px-3 text-primary-foreground"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </article>
  );
}
