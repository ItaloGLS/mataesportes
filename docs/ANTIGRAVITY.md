# Mata Esportes: continuidade no Antigravity

## O que você recebeu
Site React 19 + TanStack Start, backend Lovable Cloud real, perfis públicos, currículo esportivo editável, feed com fotos, curtidas e comentários, seguidores, eventos e inscrições. Não existem dados de demonstração. Atleta/Treinador/Olheiro é uma atuação declarada, não uma permissão administrativa.

O acabamento grafite/amarelo foi aprovado no celular e no desktop. Preserve fontes Barlow Condensed (títulos/números) e Manrope (texto), menu transparente, separação por espaço, botões amarelos e cantos suaves.

## Rodar o site
1. Instale Bun e uma versão atual de Node compatível com Vite 8.
2. Copie `.env.example` para `.env` e preencha localmente os valores de conexão do ambiente autorizado. Nenhuma chave privada acompanha o ZIP.
3. Execute `bun install` e `bun run dev -- --host 0.0.0.0 --port 8080`.
4. `bun run test` executa testes locais; testes de banco pulam quando credenciais administrativas de teste não estão disponíveis.
5. Para gerar artefatos fora do Lovable, use `bun run build`. O projeto mantém o adaptador de hospedagem atual; mudar para outra hospedagem exige revisar Vite/Nitro e seus bindings, sem trocar o roteador por React Router.

Não foi testada uma publicação externa. O código usa o pacote público `@lovable.dev/vite-tanstack-config`; não substitua plugins sem conferir o que ele já inclui.

## Configuração e portabilidade
O mesmo backend pode servir site e app. Não é necessário recriar o banco ao abrir o código em outra IDE.
- Configuração pública do cliente: URL acessível ao navegador e chave publicável do ambiente autorizado. Não use a URL interna do sandbox.
- Configuração de servidor: URL de servidor acessível à hospedagem e chave publicável. As operações normais do site NÃO precisam de chave administrativa.
- `src/integrations/supabase/*` é gerado pela integração no Lovable. Fora daqui, confira as variáveis e a camada de armazenamento de sessão de preview; no app nativo use um cliente próprio, nunca copie essa camada de preview.
- Nenhum dump de contas, fotos ou conteúdo pessoal acompanha o código. As migrações reproduzem estrutura e segurança, não dados.
- Em uma instância nova, crie o bucket PRIVADO `sports-media` pela API de Storage antes dos uploads, com limite de 5 MB. Execute as migrações SQL de `drizzle/migrations` em ordem, preservando grants, políticas e triggers. Não aplique novamente no backend que já recebeu essas migrações.
- Domínios externos e links de recuperação precisam ser autorizados nas configurações de autenticação do backend. Nunca desative confirmação de e-mail apenas para facilitar testes.

## Mapa técnico
- `src/lib/data.ts`: tipos de transporte e referências de cidades/modalidades, sem registros fictícios.
- `src/lib/domain/schemas.ts`: validações independentes de DOM, reaproveitáveis.
- `src/lib/platform.functions.ts`: consultas públicas e mutações autenticadas para o site.
- `src/lib/queries.ts`: cache público; `src/lib/store.tsx`: sessão, hooks de dados/mutação, envio de fotos.
- `src/router.tsx`: QueryClient por instância e integração SSR para não hidratar com conteúdo antigo.
- `src/routes/*`: telas web. Não importar telas HTML diretamente no React Native.
- `drizzle/migrations/*`: esquema, permissões por usuário, regras de vagas e currículo salvo atomicamente.

## Dados e operações compartilhadas
IDs são UUIDs reais. Perfil usa o mesmo ID da conta. Autores e organizadores referenciam perfis.
- `profiles`: nome, atuação, cidade, modalidades, bio e caminho de foto. Não contém e-mail.
- `podios`, `marcas`: currículo do próprio usuário.
- `posts`, `comments`, `likes`, `follows`: conteúdo público e relações reais; somente autores/donos modificam seus registros.
- `eventos`: dono organiza/edita; `inscricoes`: leitura somente pelo participante ou organizador.
- `event_counts()` retorna apenas ID de evento e quantidade, publicamente; nunca nomes dos participantes.
- `save_sports_profile(payload)` salva perfil, pódios e marcas em uma transação, com políticas do usuário.
- Fotos usam caminhos `UUID-do-usuario/UUID-do-arquivo.ext`. Upload só pelo dono. Imagens referenciadas em conteúdo esportivo público podem ter URLs assinadas de leitura, mesmo com bucket privado. URLs expiram em uma hora, e o site atualiza a consulta periodicamente.
- Inscrições duplicadas não criam segunda linha; trigger com trava no evento impede excesso de vagas simultâneo. Reduzir capacidade abaixo dos inscritos é bloqueado.

## React Native: plano de execução
1. Criar app Expo/React Native em uma pasta separada ou monorepo, sem substituir o site.
2. Extrair/reutilizar tipos, referências e schemas em pacote TypeScript compartilhado, sem React DOM, `File`, CSS ou TanStack Start.
3. Criar adaptador nativo de autenticação/dados usando o SDK de dados, armazenamento seguro de sessão e as mesmas políticas do backend.
4. Para email/senha, usar os métodos de autenticação do SDK e configurar deep links de confirmação/recuperação. Não reutilizar redirects HTTP do navegador como se fossem links nativos.
5. Usar consultas do SDK e os RPCs de banco para as operações protegidas. Não fazer fetch das URLs internas `/_serverFn/*`: elas têm protocolo próprio do TanStack.
6. Recriar telas com View/Text/Image e navegação nativa: Feed, Eventos, Busca, Perfil e Auth. A barra inferior web é só referência visual.
7. Uploads nativos precisam de bytes/ArrayBuffer apropriados, não do objeto `File` da web; reutilizar o limite e os formatos permitidos.
8. Testar Android/iOS com duas contas reais: sessão, recarregar, seguir, inscrições concorrentes, links de recuperação e fotos.
9. Se futuramente alguma ação precisar de processamento servidor externo, criar API HTTP estável com validação de identidade em cada chamada; não expor chaves administrativas no app.

## Verificação e limites
Cadastro mostra confirmação pendente; login, edição de perfil/currículo, publicar/editar, curtir, comentar, seguir, criar evento, inscrever/cancelar e persistência foram exercitados no navegador com contas temporárias. Testes de banco cobrem propriedade, escrita anônima, curtidas únicas, inscrição única e vagas simultâneas.
Os dados de teste são removidos, não viram demonstração. Os avisos do verificador de segurança para `event_counts()` são intencionais: a função pública privilegiada retorna somente contagens, com busca fixa, sem identidades.
Ainda não há pagamentos, moderação/admin, notificações push, tempo real ou aplicativo nativo. O envio de link de recuperação pode ser testado, mas a entrega de e-mail na caixa do usuário e o clique no link não devem ser considerados verificados sem uma caixa real acessível. Não use links administrativos para simular consentimento de login.

## Prompt para Claude Sonnet

Você está recebendo o código-fonte real do Mata Esportes. Leia AGENTS.md, README.md, docs/ANTIGRAVITY.md e as migrações antes de modificar. Mantenha o site React 19/TanStack Start funcionando e crie um app Expo/React Native separado para Android/iOS, compartilhando o backend Lovable Cloud existente. Preserve identidade grafite/amarelo, Barlow Condensed nos títulos e Manrope no texto, cantos suaves, controles de toque e interface enxuta. Não crie mock data, usuário fixo ou contagens inventadas. Extraia tipos e validações independentes de DOM para pacote compartilhado e crie adaptadores de acesso web/nativo. Não importe funções TanStack Start no app nem chame seu protocolo interno por HTTP. Use o SDK de autenticação/dados com sessão segura, RLS e RPCs transacionais existentes. Implemente deep links reais para confirmação e recuperação de senha. Nunca coloque chaves privadas no aplicativo. Faça um plano, preserve permissões e regras de vagas, teste fluxos com usuários reais e documente o que não foi verificado.
