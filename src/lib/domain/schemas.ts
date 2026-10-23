import { z } from 'zod';
import { CIDADES, MODALIDADES } from '../data';

const uuid = z.string().uuid();
const cidade = z.string().refine(v => CIDADES.includes(v), 'Selecione uma cidade');
const modalidade = z.string().refine(v => MODALIDADES.includes(v), 'Selecione uma modalidade');
const text = (max: number) => z.string().trim().min(1, 'Preencha o campo').max(max);

export function calculateAge(birthdateStr: string, referenceDate: Date = new Date()): number {
  const parts = birthdateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return 0;
  const [year, month, day] = parts;
  const birth = new Date(year, month - 1, day);
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const m = referenceDate.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function isMinor(birthdateStr: string, referenceDate: Date = new Date()): boolean {
  return calculateAge(birthdateStr, referenceDate) < 18;
}

export const birthdateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (AAAA-MM-DD)')
  .refine(v => !Number.isNaN(Date.parse(v + 'T12:00:00')), 'Data inexistente')
  .refine(v => {
    const age = calculateAge(v);
    return age >= 5 && age <= 120;
  }, 'Idade deve estar entre 5 e 120 anos');

export const postSchema = z.object({
  texto: text(5000),
  tipo: z.enum(['Notícia', 'Conquista', 'Treino', 'Peneira']),
  modalidade,
  cidade,
  image_path: z.string().nullable()
});

export const eventSchema = z.object({
  nome: text(200).min(3),
  modalidade,
  cidade,
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v + 'T12:00:00')), 'Data inválida'),
  local: text(300),
  vagas: z.number().int().min(1).max(100000),
  valor: z.string().trim().max(100),
  descricao: z.string().trim().max(5000),
  categorias: z.array(text(100)).max(30),
  horario: z.string().refine(v => v === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(v), 'Horário inválido').default(''),
  encerrado: z.boolean().default(false),
  resultado: z.array(z.object({ posicao: z.number().int().min(1).max(1000), nome: text(200), marca: z.string().trim().max(100) })).max(200).default([])
});

export const profileSchema = z.object({
  nome: text(100).min(2),
  atuacao: z.enum(['Atleta', 'Treinador', 'Olheiro']),
  cidade,
  modalidades: z.array(modalidade).max(8),
  bio: z.string().max(2000),
  avatar_path: z.string().nullable(),
  podios: z.array(z.object({ titulo: text(200), posicao: z.number().int().min(1).max(3), ano: z.number().int().min(1900).max(2200) })).max(100),
  marcas: z.array(z.object({ prova: text(100), valor: text(100) })).max(100)
});

export const opportunitySchema = z.object({
  tipo: z.enum(['Edital', 'Bolsa', 'Processo seletivo']),
  titulo: text(200).min(3),
  organizacao: text(200),
  descricao: z.string().trim().max(5000),
  cidade,
  modalidade: z.string().refine(v => v === '' || MODALIDADES.includes(v), 'Selecione uma modalidade'),
  link: z.string().trim().max(500).refine(v => v === '' || /^https?:\/\//.test(v), 'Use um link começando com http:// ou https://'),
  prazo: z.string().refine(v => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v + 'T12:00:00'))), 'Data inválida'),
  status: z.enum(['pendente', 'aprovada', 'rejeitada']).default('pendente')
});

export const reportSchema = z.object({
  target_type: z.enum(['post', 'profile', 'opportunity', 'comment']),
  target_id: uuid,
  reason: text(1000).min(3, 'A justificativa deve ter no mínimo 3 caracteres')
});

export const reviewReportSchema = z.object({
  report_id: z.number().int(),
  status: z.enum(['analisado', 'descartado']),
  hide_target: z.boolean().default(false),
  target_type: z.enum(['post', 'profile', 'opportunity', 'comment']),
  target_id: uuid
});

export const reviewOpportunitySchema = z.object({
  opportunity_id: uuid,
  status: z.enum(['aprovada', 'rejeitada'])
});

export const applySanctionSchema = z.object({
  user_id: uuid,
  sanction_type: z.enum(['warning', 'suspension', 'ban']),
  reason: text(500).min(3, 'A justificativa deve ter no mínimo 3 caracteres'),
  duration_days: z.number().int().min(1).max(365).optional()
});

export const actionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('post.create'), value: postSchema }),
  z.object({ kind: z.literal('post.update'), id: uuid, value: postSchema }),
  z.object({ kind: z.literal('post.delete'), id: uuid }),
  z.object({ kind: z.literal('like'), id: uuid, active: z.boolean() }),
  z.object({ kind: z.literal('comment.create'), id: uuid, texto: text(2000) }),
  z.object({ kind: z.literal('comment.delete'), id: uuid }),
  z.object({ kind: z.literal('event.create'), value: eventSchema }),
  z.object({ kind: z.literal('event.update'), id: uuid, value: eventSchema }),
  z.object({ kind: z.literal('event.delete'), id: uuid }),
  z.object({ kind: z.literal('registration'), id: uuid, active: z.boolean() }),
  z.object({ kind: z.literal('follow'), id: uuid, active: z.boolean() }),
  z.object({ kind: z.literal('profile'), value: profileSchema }),
  z.object({ kind: z.literal('opportunity.create'), value: opportunitySchema }),
  z.object({ kind: z.literal('opportunity.update'), id: uuid, value: opportunitySchema }),
  z.object({ kind: z.literal('opportunity.delete'), id: uuid }),
  z.object({ kind: z.literal('report'), value: reportSchema }),
  z.object({
    kind: z.literal('profile_private.save'),
    birthdate: birthdateSchema,
    parent_email: z.string().email('E-mail do responsável inválido').optional().nullable(),
    consent_given: z.boolean().default(false)
  }),
  z.object({ kind: z.literal('moderation.review_report'), value: reviewReportSchema }),
  z.object({ kind: z.literal('moderation.review_opportunity'), value: reviewOpportunitySchema }),
  z.object({ kind: z.literal('moderation.apply_sanction'), value: applySanctionSchema })
]);

export type Action = z.infer<typeof actionSchema>;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImage(file: { size: number; type: string }) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('A imagem deve ter no máximo 5 MB.');
}
