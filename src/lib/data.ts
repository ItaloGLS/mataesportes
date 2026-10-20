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
  horario: string; encerrado: boolean; resultado: ResultadoItem[];
}
export interface ResultadoItem { posicao: number; nome: string; marca: string }
const EQUIPES = ["Futebol", "Futsal", "Vôlei"];
const TEMPO = ["Corrida", "Ciclismo", "Natação", "Atletismo"];
/** Label for the score column of a final result, depending on the sport. */
export const marcaLabel = (modalidade: string) => EQUIPES.includes(modalidade) ? "Placar / pontos" : TEMPO.includes(modalidade) ? "Tempo / marca" : "Resultado";
export const participanteLabel = (modalidade: string) => EQUIPES.includes(modalidade) ? "Equipe" : "Atleta";
export const TIPOS_OPORTUNIDADE = ["Edital", "Bolsa", "Processo seletivo"] as const;
export type TipoOportunidade = (typeof TIPOS_OPORTUNIDADE)[number];
export interface Oportunidade {
  id: string; autor: string; tipo: TipoOportunidade; titulo: string; organizacao: string;
  descricao: string; cidade: string; modalidade: string | null; link: string; prazo: string | null; created_at: string;
}
export const formatData = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
export const initials = (name: string) => name.trim().split(/\s+/).slice(0,2).map(s => s[0]).join('').toUpperCase();
