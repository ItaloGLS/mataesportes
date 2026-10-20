import { createContext, useContext, useState, type ReactNode } from "react";
import { EVENTOS, POSTS, type Evento, type Post } from "./data";

export const ME = "joao";

interface Store {
  posts: Post[]; eventos: Evento[]; liked: Set<string>; inscricoes: Set<string>;
  toggleLike: (id: string) => void; comentar: (id: string, texto: string) => void;
  publicar: (p: Omit<Post, "id" | "autor" | "tempo" | "likes" | "comentarios">) => void;
  inscrever: (id: string) => void; criarEvento: (e: Omit<Evento, "id" | "inscritos" | "organizador">) => void;
}
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState(POSTS);
  const [eventos, setEventos] = useState(EVENTOS);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [inscricoes, setInsc] = useState<Set<string>>(new Set());

  const value: Store = {
    posts, eventos, liked, inscricoes,
    toggleLike: (id) => {
      const has = liked.has(id);
      const n = new Set(liked); has ? n.delete(id) : n.add(id); setLiked(n);
      setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, likes: p.likes + (has ? -1 : 1) } : p)));
    },
    comentar: (id, texto) =>
      setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, comentarios: [...p.comentarios, { autor: ME, texto }] } : p))),
    publicar: (p) => setPosts((ps) => [{ ...p, id: crypto.randomUUID(), autor: ME, tempo: "agora", likes: 0, comentarios: [] }, ...ps]),
    inscrever: (id) => {
      if (inscricoes.has(id)) return;
      setInsc(new Set(inscricoes).add(id));
      setEventos((es) => es.map((e) => (e.id === id ? { ...e, inscritos: e.inscritos + 1 } : e)));
    },
    criarEvento: (e) => setEventos((es) => [{ ...e, id: crypto.randomUUID(), inscritos: 0, organizador: ME }, ...es]),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider ausente");
  return c;
};
