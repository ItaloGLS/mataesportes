# Progresso da Implementação de Segurança e Moderação

## Status Geral

- **Base oficial**: Branch `seguranca` sincronizada com `origin/main` (Atletar)
- **Migrações em Produção**: `0000` a `0009` (referenciadas pelo relatório técnico da Atletar)
- **Migração Incremental Atual**: `0010_security_moderation_and_minors.sql`

---

## Fases Concluídas

### Fase 0: Diagnóstico de Segurança
- Branch: `fase-0-diagnostico`
- Análise de schemas, RLS, storage e isolamento de banco.
- Documento `docs/FORA-DO-ESCOPO.md` registrando vulnerabilidades pré-existentes.

### Fase 1: Admin, Roles e Auditoria
- Branch: `fase-1-admin-auditoria`
- Migração `0007_admin_roles_audit.sql` (aplicada / compatibilizada com `user_roles`).
- Funções `has_role()` e `grant_role()` com `SECURITY DEFINER` e auditoria append-only.

### Fase 2: Menores, Moderação, Denúncias e Schemas de Domínio
- Branch: `fase-2-menores-e-moderacao`
- **Migração [0010_security_moderation_and_minors.sql](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/drizzle/migrations/0010_security_moderation_and_minors.sql)**:
  - Tabela `profile_private` isolada (somente o próprio usuário ou staff acessam).
  - Colunas `verified` e `is_minor` em `profiles` protegidas por trigger contra alteração direta.
  - Tabela `user_sanctions` com suporte a `warning`, `suspension` e `ban`.
  - Função `is_restricted(uid)` para bloqueio imediato a nível de banco.
  - Coluna `status` em `oportunidades` (`pendente`, `aprovada`, `rejeitada`) com RLS filtrando apenas aprovadas para visitantes.
  - Tabela `reports` para denúncias de posts, perfis, comentários e oportunidades.
  - Trigger `trg_auto_moderation`: auto-oculta posts ou comentários após 3 denúncias distintas.
- **Validações em [schemas.ts](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/lib/domain/schemas.ts)**:
  - `calculateAge(birthdateStr)` e `isMinor(birthdateStr)` puras e agnósticas de DOM.
  - `birthdateSchema` com validação de limites (5 a 120 anos, anos bissextos e datas reais).
  - `reportSchema` com validação de tipo de alvo e justificativa.
  - Status em `opportunitySchema`.
  - Actions `report` e `profile_private.save` em `actionSchema`.
- **Testes Unitários em [schemas.test.ts](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/lib/domain/schemas.test.ts)**:
  - Casos de teste de cálculo de idade, virada de aniversário, 29 de fevereiro bissexto, validação de denúncias e status de oportunidades.
