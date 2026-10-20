export const CIDADES = ["Palmares", "Catende", "Ribeirão", "Barreiros", "Água Preta", "Escada", "Sirinhaém", "Rio Formoso", "Gameleira", "Joaquim Nabuco"];
export const MODALIDADES = ["Corrida", "Ciclismo", "Futebol", "Futsal", "Vôlei", "Natação", "Jiu-Jitsu", "Atletismo"];

export type Role = "Atleta" | "Treinador" | "Olheiro";
export interface User {
  id: string; nome: string; role: Role; cidade: string; modalidades: string[];
  bio: string; idade: number; iniciais: string;
  podios: { titulo: string; posicao: 1 | 2 | 3; ano: number }[];
  marcas: { prova: string; valor: string }[];
}
export interface Post {
  id: string; autor: string; tipo: "Notícia" | "Conquista" | "Treino" | "Peneira";
  texto: string; modalidade: string; cidade: string; tempo: string;
  likes: number; comentarios: { autor: string; texto: string }[];
}
export interface Evento {
  id: string; nome: string; modalidade: string; cidade: string; data: string;
  local: string; vagas: number; inscritos: number; valor: string; descricao: string;
  categorias: string[]; organizador: string;
}

export const USERS: User[] = [
  { id: "joao", nome: "João Victor Santos", role: "Atleta", cidade: "Palmares", modalidades: ["Corrida", "Atletismo"], idade: 22, iniciais: "JV",
    bio: "Fundista palmarense, treino nas estradas da usina desde os 15. Sonho em correr a São Silvestre no pelotão de elite.",
    podios: [{ titulo: "Corrida da Emancipação de Palmares 10K", posicao: 1, ano: 2026 }, { titulo: "Meia Maratona de Escada", posicao: 2, ano: 2025 }, { titulo: "Corrida São João de Catende 5K", posicao: 1, ano: 2025 }],
    marcas: [{ prova: "5 km", valor: "15:48" }, { prova: "10 km", valor: "33:12" }, { prova: "21 km", valor: "1:14:30" }] },
  { id: "marina", nome: "Marina Albuquerque", role: "Atleta", cidade: "Catende", modalidades: ["Ciclismo"], idade: 27, iniciais: "MA",
    bio: "Ciclista de MTB e estrada. Pedalo pelas serras da Mata Sul e organizo o pedal feminino de Catende.",
    podios: [{ titulo: "Desafio MTB Serra do Ribeirão", posicao: 1, ano: 2026 }, { titulo: "GP Ciclismo Barreiros", posicao: 3, ano: 2025 }],
    marcas: [{ prova: "XCO 30 km", valor: "1:22:05" }, { prova: "Estrada 80 km", valor: "2:21:40" }] },
  { id: "carlos", nome: "Prof. Carlos Henrique", role: "Treinador", cidade: "Ribeirão", modalidades: ["Futebol", "Futsal"], idade: 41, iniciais: "CH",
    bio: "Treinador CREF, coordenador da escolinha Ribeirão FC Sub-15 e Sub-17. Revelou 4 atletas para a base do Sport e Náutico.",
    podios: [{ titulo: "Copa Mata Sul Sub-15 (técnico)", posicao: 1, ano: 2025 }, { titulo: "Jogos Escolares PE — Futsal", posicao: 2, ano: 2024 }],
    marcas: [{ prova: "Atletas revelados", valor: "4" }, { prova: "Anos de carreira", valor: "16" }] },
  { id: "renata", nome: "Renata Lins", role: "Olheiro", cidade: "Barreiros", modalidades: ["Futebol", "Vôlei"], idade: 35, iniciais: "RL",
    bio: "Analista de desempenho e captadora de talentos para clubes do Recife. Sempre de olho nas peneiras do interior.",
    podios: [], marcas: [{ prova: "Peneiras acompanhadas", valor: "38" }] },
  { id: "pedro", nome: "Pedro Henrique Lima", role: "Atleta", cidade: "Barreiros", modalidades: ["Natação", "Atletismo"], idade: 17, iniciais: "PH",
    bio: "Nadador de águas abertas criado no mar de Barreiros. Atleta do Bolsa Atleta estadual.",
    podios: [{ titulo: "Travessia de Tamandaré 1.5K", posicao: 2, ano: 2026 }, { titulo: "Estadual Juvenil 400m livre", posicao: 3, ano: 2025 }],
    marcas: [{ prova: "400m livre", valor: "4:31" }, { prova: "Travessia 1.5K", valor: "19:52" }] },
];

export const POSTS: Post[] = [
  { id: "p1", autor: "carlos", tipo: "Peneira", modalidade: "Futebol", cidade: "Ribeirão", tempo: "2 h",
    texto: "⚽ PENEIRA ABERTA! Ribeirão FC avalia atletas nascidos entre 2009 e 2012 no sábado, 7h, Estádio Municipal. Levar RG, chuteira e atestado. Olheiros de clubes da capital confirmados!", likes: 128,
    comentarios: [{ autor: "renata", texto: "Estarei lá! Bora revelar talento da Mata Sul 👀" }] },
  { id: "p2", autor: "joao", tipo: "Conquista", modalidade: "Corrida", cidade: "Palmares", tempo: "5 h",
    texto: "Campeão dos 10K da Emancipação de Palmares com 33:12, meu novo recorde pessoal! Obrigado a todos que gritaram na reta da Praça Paulo Paranhos 🏆", likes: 342,
    comentarios: [{ autor: "marina", texto: "Monstro! Parabéns 👏" }, { autor: "pedro", texto: "Inspiração demais!" }] },
  { id: "p3", autor: "marina", tipo: "Treino", modalidade: "Ciclismo", cidade: "Catende", tempo: "1 d",
    texto: "Pedal feminino de domingo: 62 km Catende → Jaqueira → Catende, 900 m de altimetria entre os canaviais. Próximo encontro 5h30 em frente à Usina. Todas são bem-vindas! 🚴‍♀️", likes: 87, comentarios: [] },
  { id: "p4", autor: "renata", tipo: "Notícia", modalidade: "Vôlei", cidade: "Barreiros", tempo: "2 d",
    texto: "Governo de PE abriu edital do Bolsa Atleta 2027. Atletas da Mata Sul com resultados em estaduais podem se inscrever até 30/11. Não deixem passar!", likes: 205,
    comentarios: [{ autor: "pedro", texto: "Já tô separando os documentos!" }] },
];

export const EVENTOS: Evento[] = [
  { id: "e1", nome: "Corrida das Águas de Palmares", modalidade: "Corrida", cidade: "Palmares", data: "2026-11-15", local: "Praça Paulo Paranhos", vagas: 800, inscritos: 612, valor: "R$ 60",
    descricao: "Percurso às margens do Rio Una com largada no centro histórico. Kit com camisa, medalha finisher e hidratação a cada 2,5 km.", categorias: ["5 km", "10 km", "Kids 1 km"], organizador: "carlos" },
  { id: "e2", nome: "Desafio MTB Serra do Ribeirão", modalidade: "Ciclismo", cidade: "Ribeirão", data: "2026-11-29", local: "Engenho Cachoeira", vagas: 250, inscritos: 198, valor: "R$ 90",
    descricao: "Trilhas entre canaviais e mata atlântica com subidas técnicas. Categorias por idade e Elite.", categorias: ["Sport 35 km", "Elite 55 km"], organizador: "marina" },
  { id: "e3", nome: "Copa Mata Sul de Futebol Sub-17", modalidade: "Futebol", cidade: "Catende", data: "2026-12-06", local: "Estádio Municipal de Catende", vagas: 16, inscritos: 11, valor: "Gratuito",
    descricao: "Torneio entre seleções municipais com presença de olheiros de clubes pernambucanos. Inscrição por equipe.", categorias: ["Equipes Sub-17"], organizador: "carlos" },
  { id: "e4", nome: "Travessia Mar de Barreiros", modalidade: "Natação", cidade: "Barreiros", data: "2026-12-13", local: "Praia de Carneiros", vagas: 300, inscritos: 140, valor: "R$ 80",
    descricao: "Prova de águas abertas em mar calmo e piscinas naturais, com apoio de caiaques e salva-vidas.", categorias: ["1,5 km", "3 km"], organizador: "pedro" },
  { id: "e5", nome: "Festival de Vôlei de Areia", modalidade: "Vôlei", cidade: "Sirinhaém", data: "2027-01-10", local: "Praia de Guadalupe", vagas: 48, inscritos: 20, valor: "R$ 40 / dupla",
    descricao: "Duplas masculinas, femininas e mistas. Premiação em dinheiro para os três primeiros.", categorias: ["Masculino", "Feminino", "Misto"], organizador: "renata" },
];

export const userById = (id: string) => USERS.find((u) => u.id === id);
export const formatData = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
