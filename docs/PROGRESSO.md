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
- Branch: `fase-2-menores-e-moderacao` (mesclada em `seguranca`)
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

### Fase 3: Fluxo de Denúncia & Moderação na UI
- Branch: `fase-3-ui-denuncia-e-moderacao` (mesclada em `seguranca`)
- **Componente [ReportModal.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/ReportModal.tsx)**:
  - Modal acessível com opções categorizadas de denúncia (golpes/links falsos, risco para menores, perfil falso, ofensas).
  - Integração nos cards de publicações ([PostCard.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/PostCard.tsx)), oportunidades ([OportunidadeCard.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/OportunidadeCard.tsx)) e na página de perfil ([perfil.$id.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/routes/perfil.$id.tsx)).
- **Componente [BirthdatePromptModal.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/BirthdatePromptModal.tsx)**:
  - Coleta de data de nascimento com cálculo de idade instantâneo, aviso de proteção de menores para < 18 anos, e termo de consentimento parental.
- **Moderação de Oportunidades**:
  - Banner informativo em [OportunidadeForm.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/OportunidadeForm.tsx) explicando a verificação prévia de links e oportunidades pela moderação.
  - Filtro em `getOpportunities()` e `getFeed()` ignorando itens ocultos ou pendentes de aprovação.

### Fase 4: Painel de Moderação & Gestão de Sanções
- Branch: `fase-4-painel-moderacao` (mesclada em `seguranca`)
- **Rota Dedicada [admin.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/routes/admin.tsx)**:
  - Painel exclusivo para equipe com papel de `moderator` ou `admin` (`is_staff(auth.uid())`).
  - **Aba Denúncias:** Fila em tempo real de denúncias recebidas com opções de descartar ou ocultar o conteúdo ofensivo e resolver a denúncia.
  - **Aba Oportunidades:** Fila de editais e bolsas submetidos por usuários comuns, com aprovação direta ou rejeição.
  - **Aba Sanções:** Interface para aplicar advertências, suspensões temporárias (com prazo em dias) e banimentos permanentes a usuários infratores, gravando no log imutável de auditoria.
- **Acesso no Shell [Shell.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/Shell.tsx)**:
  - Item "Moderação" inserido no menu suspenso do avatar do usuário.
- **Server Functions & Schemas**:
  - `getModerationData()` e handlers de revisão no servidor TanStack Start com validação estrita de identidade e papéis.
  - Schemas e testes unitários em [schemas.ts](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/lib/domain/schemas.ts) e [schemas.test.ts](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/lib/domain/schemas.test.ts).

### Fase 5: Termos Legais, LGPD & Diretrizes Institucionais
- Branch: `fase-5-termos-lgpd-e-seguranca`
- **Nova Rota [termos.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/routes/termos.tsx)**:
  - Aba **Termos de Uso**: regras de participação, combate a autodeclaração falsa de funções, moderação de oportunidades e sanções.
  - Aba **Privacidade & LGPD**: conformidade com a Lei 13.709/2018, minimização de dados e isolamento em `profile_private`.
  - Aba **Proteção a Menores**: regras do ECA, ocultação de cidade em consultas públicas e canal direto de denúncia.
  - Aba **Diretrizes da Comunidade**: incentivo ao respeito mútuo, integridade esportiva e tolerância zero a fraudes e assédio.
- **Rodapé Institucional no [Shell.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/Shell.tsx)**:
  - Links para os Termos de Uso, Privacidade e Proteção a Menores.
- **Tela de Cadastro [auth.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/routes/auth.tsx)**:
  - Aviso de concordância com os termos e proteção a menores ao cadastrar conta.
