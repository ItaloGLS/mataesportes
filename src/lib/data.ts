export const CIDADES = ["Palmares", "Catende", "Ribeirão", "Barreiros", "Água Preta", "Escada", "Sirinhaém", "Rio Formoso", "Gameleira", "Joaquim Nabuco"];
export const MODALIDADES = ["Corrida", "Ciclismo", "Futebol", "Futsal", "Vôlei", "Natação", "Jiu-Jitsu", "Atletismo"];
export type Role = "Atleta" | "Treinador" | "Olheiro";
export interface User {
  id: string; nome: string; role: Role; cidade: string; modalidades: string[]; bio: string; iniciais: string; avatar_path: string | null; avatarUrl?: string | undefined;
  podios: { titulo: string; posicao: 1 | 2 | 3; ano: number }[];
  marcas: { prova: string; valor: string }[];
}
export interface Post {
  id: string; autor: string; tipo: "Notícia" | "Conquista" | "Treino" | "Peneira";
  texto: string; modalidade: string; cidade: string; tempo: string; image_path: string | null; imageUrl?: string | undefined;
  likes: number; comentarios: { id: string; autor: string; texto: string }[];
}
export interface Evento {
  id: string; nome: string; modalidade: string; cidade: string; data: string; local: string;
  vagas: number; inscritos: number; valor: string; descricao: string; categorias: string[]; organizador: string;
}
export const formatData = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
export const initials = (name: string) => name.trim().split(/\s+/).slice(0,2).map(s => s[0]).join('').toUpperCase();
