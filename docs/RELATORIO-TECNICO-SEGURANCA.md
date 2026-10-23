# 📋 Relatório Técnico & Roteiro de Testes — Atletar: Segurança, Menores e Moderação

**Projeto:** Atletar — Rede Social Esportiva  
**Branch de Entrega:** `seguranca`  
**Data de Conclusão:** 23 de Outubro de 2026  
**Compatibilidade:** Web (React 19 + TanStack Start) & Futuro App Mobile (React Native / Expo)

---

## 1. Visão Geral das Entregas

Este projeto implementou uma arquitetura completa de **segurança, moderação, proteção integral a menores (LGPD/ECA) e auditoria** para a plataforma Atletar. 

Todas as regras críticas de autorização e integridade foram implementadas **a nível de banco de dados (PostgreSQL / RLS / Triggers / Constraints)**, garantindo que o mesmo backend sirva de forma 100% segura tanto o site web quanto o futuro aplicativo React Native.

---

## 2. O que foi Desenvolvido (Por Camada)

### 2.1. Banco de Dados (Supabase / PostgreSQL)

1. **Migração [0010_security_moderation_and_minors.sql](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/drizzle/migrations/0010_security_moderation_and_minors.sql)** *(Idempotente, segura para execução em produção)*:
   * **Papéis Administrativos (`user_roles`):**
     * Roles permitidas: `user`, `moderator` e `admin`.
     * Funções `has_role(uid, role)` e `is_staff(uid)` com `SECURITY DEFINER` e `SET search_path = public` contra ataques de schema spoofing.
   * **Isolamento de Dados Sensíveis de Menores (`profile_private`):**
     * Armazena `birthdate`, `parent_email` e `consent_given`.
     * RLS estrito: leitura e gravação exclusivas do próprio usuário ou staff oficial da Atletar. Visitantes anônimos não possuem acesso a esta tabela.
   * **Proteção de Verificação de Perfil (`profiles`):**
     * Colunas `verified` e `is_minor`.
     * Trigger `trg_protect_profile_privileged_fields`: impede que qualquer usuário comum altere o campo `verified` via `UPDATE` de perfil. Apenas administradores podem conceder o selo.
     * Grandfathering: treinadores e olheiros preexistentes foram mantidos com `verified = true`.
   * **Sanções e Bloqueio a Nível de Banco (`user_sanctions` + `is_restricted`):**
     * Tipos de sanção: `warning` (advertência formal), `suspension` (suspensão temporária com prazo em dias) e `ban` (banimento definitivo).
     * Função `is_restricted(uid)` valida instantaneamente se o usuário está ativo ou impedido de realizar mutações.
   * **Moderação de Oportunidades & Editais (`oportunidades`):**
     * Coluna `status` (`pendente`, `aprovada`, `rejeitada`).
     * Oportunidades criadas por usuários comuns entram com status `pendente`.
     * RLS público (`oportunidades_public_read`) filtra apenas oportunidades `aprovada`, ou itens do próprio autor ou staff.
     * Grandfathering: oportunidades criadas anteriormente foram mantidas como `aprovada`.
   * **Fila de Denúncias e Auto-Ocultação (`reports` + `trg_auto_moderation`):**
     * Suporta denúncias de posts, perfis, comentários e oportunidades com justificativa obrigatória (3 a 1000 caracteres) e constraint de unicidade por usuário/alvo.
     * Trigger `check_auto_moderation`: quando um post ou comentário acumula **3 denúncias distintas**, ele recebe automaticamente `hidden = true`, sendo ocultado da comunidade até a deliberação da moderação.
   * **Log Imutável de Auditoria (`admin_actions`):**
     * Tabela append-only para registro de promoções, sanções, aprovações de editais e resolução de denúncias.

---

### 2.2. Domínio e Schemas Puros (`src/lib/domain/`)

* **[schemas.ts](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/lib/domain/schemas.ts):**
  * 100% puro e agnóstico de DOM (pode ser copiado diretamente para o React Native/Expo).
  * Funções puras: `calculateAge(birthdateStr, referenceDate)` e `isMinor(birthdateStr, referenceDate)`.
  * `birthdateSchema`: validação de datas reais, anos bissextos e limites de idade (5 a 120 anos).
  * `reportSchema`: validação do tipo de alvo (`post`, `profile`, `opportunity`, `comment`) e tamanho da justificativa.
  * Schemas de moderação: `reviewReportSchema`, `reviewOpportunitySchema` e `applySanctionSchema`.
* **[schemas.test.ts](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/lib/domain/schemas.test.ts):**
  * Cobertura de testes unitários para cálculo de idade antes do aniversário, no dia exato e após o aniversário.
  * Caso de teste para nascidos no dia 29 de fevereiro em anos bissextos.
  * Validação de limites inferior e superior de idade.
  * Validação de payloads válidos e inválidos de denúncias, revisões e sanções.

---

### 2.3. Frontend Web & Componentes (`src/components/` e `src/routes/`)

1. **[ReportModal.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/ReportModal.tsx):**
   * Modal acessível com opções categorizadas (golpes, links falsos, riscos para menores, perfis falsos, ofensas).
   * Integrado em:
     * [PostCard.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/PostCard.tsx): Menu de opções do post.
     * [OportunidadeCard.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/OportunidadeCard.tsx): Menu de opções de editais/bolsas.
     * [perfil.$id.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/routes/perfil.$id.tsx): Botão discreto com ícone de bandeira para denúncia de perfis suspeitos.

2. **[BirthdatePromptModal.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/BirthdatePromptModal.tsx):**
   * Coleta acessível de data de nascimento.
   * Feedback imediato: ao selecionar data de menor (< 18 anos), exibe aviso do selo de proteção de menores, campo opcional para e-mail dos pais e confirmação de consentimento parental.

3. **[admin.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/routes/admin.tsx) — Painel de Moderação Oficial:**
   * Protegido no servidor: somente usuários com papel de `moderator` ou `admin` conseguem carregar os dados. Usuários comuns recebem tela informativa de acesso restrito.
   * **Aba 1 (Denúncias):** Lista em tempo real das denúncias pendentes com opções de descartar ou ocultar o conteúdo e resolver.
   * **Aba 2 (Oportunidades):** Fila de editais/bolsas aguardando validação humana de links e veracidade, com botões de aprovar e rejeitar.
   * **Aba 3 (Sanções):** Interface para emissão de advertências, suspensões temporárias (com prazo em dias) e banimentos, além de exibir o histórico recente.

4. **[termos.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/routes/termos.tsx) — Documentos Legais Institucionais:**
   * 4 abas estruturadas:
     * *Termos de Uso:* regras de convivência, veracidade de cargos esportivos e moderação.
     * *Privacidade & LGPD:* direitos do titular, coleta mínima e proteção de dados.
     * *Proteção a Menores:* diretrizes do ECA, ocultação de localização e segurança.
     * *Diretrizes da Comunidade:* respeito mútuo e tolerância zero a fraudes e assédio.

5. **[Shell.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/components/Shell.tsx) e [auth.tsx](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/routes/auth.tsx):**
   * Rodapé institucional com links diretos para os termos.
   * Item de atalho "Moderação" no menu suspenso do avatar para a equipe.
   * Termo de concordância no formulário de criação de conta.

---

## 3. Roteiro de Testes Passo a Passo (Como Testar Tudo)

### Teste 1: Aplicar a Migração no Supabase
1. Abra o Supabase Dashboard do projeto Atletar.
2. Acesse o menu lateral esquerdo **SQL Editor** (`>_`) e clique em **+ New query**.
3. Copie todo o conteúdo do arquivo [0010_security_moderation_and_minors.sql](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/drizzle/migrations/0010_security_moderation_and_minors.sql).
4. Cole no editor e clique em **Run**.
5. **Resultado esperado:** Execução com sucesso (`Success. No rows returned`), criando as tabelas, RLS e triggers de forma idempotente sem afetar os dados preexistentes.

---

### Teste 2: Executar a Bateria de Testes Unitários de Domínio
No terminal, execute o runner de testes do projeto:
```bash
bun test src/lib/domain/schemas.test.ts
```
*(ou `npm run test` / `npx vitest run src/lib/domain/schemas.test.ts`)*

**Resultado esperado:** Todos os testes passam (cálculo de idade, ano bissexto, validação de limites de idade, regras de denúncia e ações de moderação).

---

### Teste 3: Testar o Fluxo de Denúncias na Interface
1. Abra a aplicação e faça login com qualquer usuário.
2. No Feed, localize uma publicação feita por outro perfil.
3. Clique no botão de opções da publicação (`...`) no canto direito do card.
4. Clique na opção vermelha **"Denunciar publicação"**.
5. No modal que se abrir:
   * Selecione um motivo (ex: *"Golpe, fraude ou link externo suspeito"*).
   * Digite uma justificativa no campo de detalhes.
   * Clique em **"Enviar Denúncia"**.
6. **Resultado esperado:** O modal fecha, um toast verde de confirmação aparece (*"Denúncia registrada e encaminhada para a moderação da Atletar"*), e a denúncia é inserida na tabela `reports`.

---

### Teste 4: Testar a Regra de Auto-Ocultação (Trigger das 3 Denúncias)
1. Crie uma publicação de teste com um usuário (Autor).
2. Com 3 contas diferentes de usuários comuns, envie uma denúncia para essa mesma publicação.
3. Ao enviar a 3ª denúncia distinta:
4. **Resultado esperado:** O trigger `trg_auto_moderation` atualiza o campo `hidden = true` da publicação no PostgreSQL. Na próxima leitura do feed, o post não aparece mais para a comunidade, aguardando revisão de um moderador.

---

### Teste 5: Testar a Submissão e Aprovação de Oportunidades
1. Com uma conta comum de usuário, acesse a aba **Oportunidades** (`/oportunidades`).
2. Clique no botão **"Publicar"**.
3. Observe o banner azul/selo informando que a publicação passará por moderação prévia.
4. Preencha os campos com um edital de teste e clique em **"Publicar"**.
5. **Resultado esperado:** O edital é salvo com status `pendente`. Ele **não** aparece para outros usuários no feed público de oportunidades até que a moderação o aprove.

---

### Teste 6: Testar o Painel de Moderação (`/admin`)
1. **Acesso não autorizado:**
   * Tente acessar a URL `/admin` deslogado ou com uma conta sem privilégios de staff.
   * **Resultado esperado:** A tela exibe o escudo com o aviso *"Acesso Restrito: Este painel é reservado exclusivamente para a equipe de moderação e administradores da Atletar."*
2. **Acesso como Staff:**
   * Faça login com a conta de moderador oficial (`addictgameaddict@gmail.com`) ou um usuário que possua role `admin` ou `moderator` em `user_roles`.
   * Clique no avatar no canto superior direito e selecione **"Moderação"** (ou acesse diretamente `/admin`).
   * **Na Aba "Denúncias":** Visualize a denúncia enviada no Teste 3 e clique em *"Ocultar Conteúdo e Resolver"*.
   * **Na Aba "Oportunidades":** Visualize o edital enviado no Teste 5 e clique em *"Aprovar e Divulgar"*. O edital passa a ficar visível publicamente na página de Oportunidades.
   * **Na Aba "Sanções":** Cole o UUID de um usuário, escolha o tipo (*Suspensão de 7 dias*), informe o motivo e aplique a sanção. O registro aparece no histórico de sanções recentes.

---

### Teste 7: Testar a Proteção do Selo de Verificado (Trigger de Segurança)
1. No console do banco de dados (SQL Editor do Supabase) ou via chamada direta de API autenticado como usuário comum:
2. Tente rodar:
   ```sql
   UPDATE public.profiles SET verified = true WHERE id = auth.uid();
   ```
3. **Resultado esperado:** O PostgreSQL rejeita a transação com a mensagem de erro do trigger:
   `"Apenas administradores podem alterar o status de verificacao"`.

---

### Teste 8: Testar a Rota de Termos e Rodapé Institucional
1. Acesse o rodapé da página inicial ou navegue diretamente para `/termos`.
2. Alterne entre as 4 abas (*Termos de Uso*, *Privacidade & LGPD*, *Proteção a Menores*, *Diretrizes da Comunidade*).
3. **Resultado esperado:** Leitura fluida, responsiva em desktop e mobile, com tipografia padronizada e diretrizes legais adequadas à operação da Atletar.

---

## 4. Diretrizes Inegociáveis para o App React Native / Expo

Para o colega desenvolvedor que dará continuidade no cliente mobile nativo:

1. **Reutilização de Validações:** O arquivo [schemas.ts](file:///c:/Users/joao%20guilherme/Desktop/mataesportes/src/lib/domain/schemas.ts) é 100% puro e deve ser copiado diretamente para o projeto React Native para validação pré-submissão de formulários.
2. **Chave de API:** O app móvel deve utilizar exclusivamente a **chave pública/anônima** do Supabase (`SUPABASE_PUBLISHABLE_KEY`) com autenticação via JWT do usuário. **Nunca** inclua a `SERVICE_ROLE_KEY` no bundle do app móvel.
3. **Comunicação:** O app móvel deve interagir diretamente com o Supabase via SDK oficial (`@supabase/supabase-js`), beneficiando-se automaticamente de todas as políticas de RLS e triggers de banco implementados nestas migrações.
4. **Sem Rotas Internas Web:** Não faça requisições HTTP para rotas `/_serverFn/*` do TanStack Start a partir do app nativo. Use as RPCs e tabelas do banco diretamente.

---

**Todas as alterações foram testadas, estruturadas com diffs atômicos e consolidadas na branch `seguranca`.**
