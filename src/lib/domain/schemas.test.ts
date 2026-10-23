import { describe, it, expect } from 'vitest';
import {
  actionSchema,
  eventSchema,
  opportunitySchema,
  validateImage,
  MAX_IMAGE_BYTES,
  calculateAge,
  isMinor,
  birthdateSchema,
  reportSchema
} from './schemas';

const opportunity = {
  tipo: 'Bolsa',
  titulo: 'Bolsa-atleta municipal',
  organizacao: 'Prefeitura de Palmares',
  descricao: '',
  cidade: 'Palmares',
  modalidade: '',
  link: '',
  prazo: ''
};

const event = {
  nome: 'Corrida real',
  modalidade: 'Corrida',
  cidade: 'Palmares',
  data: '2027-01-01',
  local: 'Centro',
  vagas: 1,
  valor: 'Gratuito',
  descricao: '',
  categorias: []
};

describe('Sports input rules', () => {
  it('requires at least one event place', () => {
    expect(eventSchema.safeParse({ ...event, vagas: 0 }).success).toBe(false);
    expect(eventSchema.safeParse(event).success).toBe(true);
  });
  it('rejects empty posts', () => {
    expect(actionSchema.safeParse({
      kind: 'post.create',
      value: { texto: ' ', tipo: 'Treino', modalidade: 'Corrida', cidade: 'Palmares', image_path: null }
    }).success).toBe(false);
  });
  it('allows only sports image formats', () => {
    expect(() => validateImage({ size: 100, type: 'text/html' })).toThrow();
    expect(() => validateImage({ size: 100, type: 'image/jpeg' })).not.toThrow();
  });
  it('enforces the 5 MB image limit', () => {
    expect(() => validateImage({ size: MAX_IMAGE_BYTES + 1, type: 'image/png' })).toThrow();
    expect(() => validateImage({ size: 5 * 1024 * 1024, type: 'image/png' })).not.toThrow();
  });
  it('accepts a valid opportunity', () => {
    const res = opportunitySchema.safeParse(opportunity);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe('pendente');
    }
  });
  it('rejects opportunity links without http', () => {
    expect(opportunitySchema.safeParse({ ...opportunity, link: 'www.exemplo.com' }).success).toBe(false);
    expect(opportunitySchema.safeParse({ ...opportunity, link: 'https://exemplo.com/edital' }).success).toBe(true);
  });
  it('rejects invalid opportunity types and cities', () => {
    expect(opportunitySchema.safeParse({ ...opportunity, tipo: 'Sorteio' }).success).toBe(false);
    expect(opportunitySchema.safeParse({ ...opportunity, cidade: 'Recife' }).success).toBe(false);
  });
  it('rejects invalid opportunity deadlines', () => {
    expect(opportunitySchema.safeParse({ ...opportunity, prazo: '20/10/2026' }).success).toBe(false);
    expect(opportunitySchema.safeParse({ ...opportunity, prazo: '2027-03-01' }).success).toBe(true);
  });
});

describe('Event schedule and results', () => {
  it('accepts a valid time and rejects invalid ones', () => {
    expect(eventSchema.safeParse({ ...event, horario: '07:30' }).success).toBe(true);
    expect(eventSchema.safeParse({ ...event, horario: '25:00' }).success).toBe(false);
  });
  it('requires a name in each final result row', () => {
    expect(eventSchema.safeParse({ ...event, encerrado: true, resultado: [{ posicao: 1, nome: '', marca: '3x1' }] }).success).toBe(false);
    expect(eventSchema.safeParse({ ...event, encerrado: true, resultado: [{ posicao: 1, nome: 'Palmares FC', marca: '3x1' }] }).success).toBe(true);
  });
});

describe('Age calculation and Minor protection rules', () => {
  const refDate = new Date(2026, 9, 23); // 23 de Outubro de 2026

  it('calculates exact age correctly before and after birthday', () => {
    // Aniversário em 24 de outubro (ainda não fez 18 anos na refDate de 23 de outubro)
    expect(calculateAge('2008-10-24', refDate)).toBe(17);
    expect(isMinor('2008-10-24', refDate)).toBe(true);

    // Aniversário exatamente em 23 de outubro (completa 18 hoje)
    expect(calculateAge('2008-10-23', refDate)).toBe(18);
    expect(isMinor('2008-10-23', refDate)).toBe(false);

    // Aniversário em 22 de outubro (fez 18 ontem)
    expect(calculateAge('2008-10-22', refDate)).toBe(18);
    expect(isMinor('2008-10-22', refDate)).toBe(false);
  });

  it('handles leap year birthdays properly', () => {
    // Nascido em 29 de fevereiro de 2008 (ano bissexto)
    const ref2026Feb28 = new Date(2026, 1, 28);
    const ref2026Mar01 = new Date(2026, 2, 1);
    expect(calculateAge('2008-02-29', ref2026Feb28)).toBe(17);
    expect(calculateAge('2008-02-29', ref2026Mar01)).toBe(18);
  });

  it('validates birthdateSchema boundaries and formats', () => {
    expect(birthdateSchema.safeParse('2010-05-15').success).toBe(true);
    expect(birthdateSchema.safeParse('invalid-date').success).toBe(false);
    expect(birthdateSchema.safeParse('15/05/2010').success).toBe(false);
    // Idade abaixo de 5 anos (ex: bebê nascido em 2025)
    expect(birthdateSchema.safeParse('2025-01-01').success).toBe(false);
  });
});

describe('Moderation and Report rules', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  it('validates correct report structures', () => {
    const validReport = {
      target_type: 'post',
      target_id: validUUID,
      reason: 'Conteúdo ofensivo ou fora das regras esportivas'
    };
    expect(reportSchema.safeParse(validReport).success).toBe(true);
    expect(actionSchema.safeParse({ kind: 'report', value: validReport }).success).toBe(true);
  });

  it('rejects reports with invalid targets or too short reasons', () => {
    expect(reportSchema.safeParse({
      target_type: 'unknown',
      target_id: validUUID,
      reason: 'Motivo'
    }).success).toBe(false);

    expect(reportSchema.safeParse({
      target_type: 'post',
      target_id: 'not-a-uuid',
      reason: 'Motivo'
    }).success).toBe(false);

    expect(reportSchema.safeParse({
      target_type: 'post',
      target_id: validUUID,
      reason: 'Oi' // Menos de 3 caracteres
    }).success).toBe(false);
  });
});
