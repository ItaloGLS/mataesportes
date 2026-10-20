import { z } from 'zod';
import { CIDADES, MODALIDADES } from '../data';
const uuid = z.string().uuid();
const cidade = z.string().refine(v => CIDADES.includes(v), 'Selecione uma cidade');
const modalidade = z.string().refine(v => MODALIDADES.includes(v), 'Selecione uma modalidade');
const text = (max: number) => z.string().trim().min(1,'Preencha o campo').max(max);
export const postSchema = z.object({ texto: text(5000), tipo: z.enum(['Notícia','Conquista','Treino','Peneira']), modalidade, cidade, image_path: z.string().nullable() });
export const eventSchema = z.object({ nome: text(200).min(3), modalidade, cidade, data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v + 'T12:00:00')), 'Data inválida'), local: text(300), vagas: z.number().int().min(1).max(100000), valor: z.string().trim().max(100), descricao: z.string().trim().max(5000), categorias: z.array(text(100)).max(30), horario: z.string().refine(v => v === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(v), 'Horário inválido').default(''), encerrado: z.boolean().default(false), resultado: z.array(z.object({ posicao: z.number().int().min(1).max(1000), nome: text(200), marca: z.string().trim().max(100) })).max(200).default([]) });
export const profileSchema = z.object({ nome: text(100).min(2), atuacao: z.enum(['Atleta','Treinador','Olheiro']), cidade, modalidades: z.array(modalidade).max(8), bio: z.string().max(2000), avatar_path: z.string().nullable(), podios: z.array(z.object({ titulo: text(200), posicao: z.number().int().min(1).max(3), ano: z.number().int().min(1900).max(2200) })).max(100), marcas: z.array(z.object({ prova: text(100), valor: text(100) })).max(100) });
export const opportunitySchema = z.object({ tipo: z.enum(['Edital','Bolsa','Processo seletivo']), titulo: text(200).min(3), organizacao: text(200), descricao: z.string().trim().max(5000), cidade, modalidade: z.string().refine(v => v === '' || MODALIDADES.includes(v), 'Selecione uma modalidade'), link: z.string().trim().max(500).refine(v => v === '' || /^https?:\/\//.test(v), 'Use um link começando com http:// ou https://'), prazo: z.string().refine(v => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v + 'T12:00:00'))), 'Data inválida') });
export const actionSchema = z.discriminatedUnion('kind',[
 z.object({kind:z.literal('post.create'), value:postSchema}),
 z.object({kind:z.literal('post.update'), id:uuid, value:postSchema}),
 z.object({kind:z.literal('post.delete'), id:uuid}),
 z.object({kind:z.literal('like'), id:uuid, active:z.boolean()}),
 z.object({kind:z.literal('comment.create'), id:uuid, texto:text(2000)}),
 z.object({kind:z.literal('comment.delete'), id:uuid}),
 z.object({kind:z.literal('event.create'), value:eventSchema}),
 z.object({kind:z.literal('event.update'), id:uuid, value:eventSchema}),
 z.object({kind:z.literal('event.delete'), id:uuid}),
 z.object({kind:z.literal('registration'), id:uuid, active:z.boolean()}),
 z.object({kind:z.literal('follow'), id:uuid, active:z.boolean()}),
 z.object({kind:z.literal('profile'), value:profileSchema}),
 z.object({kind:z.literal('opportunity.create'), value:opportunitySchema}),
 z.object({kind:z.literal('opportunity.update'), id:uuid, value:opportunitySchema}),
 z.object({kind:z.literal('opportunity.delete'), id:uuid}),
]);
export type Action = z.infer<typeof actionSchema>;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg','image/png','image/webp'];
export function validateImage(file: {size:number;type:string}) {
 if (!IMAGE_TYPES.includes(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
 if (file.size > MAX_IMAGE_BYTES) throw new Error('A imagem deve ter no máximo 5 MB.');
}
