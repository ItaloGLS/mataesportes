# Mata Esportes — dados reais e preparação para app

## Resultado
Transformar o site atual em uma plataforma real, com contas próprias, perfis esportivos completos e dados salvos. Preservar as fontes, as cores grafite/amarelo e a tela enxuta que você aprovou.

## 1. Contas e perfis
- Ativar Lovable Cloud para contas, banco de dados e armazenamento de fotos.
- Criar cadastro e entrada com e-mail e senha, confirmação de e-mail, recuperação de senha e saída da conta.
- Cada pessoa poderá editar nome, foto, cidade, modalidade, biografia, atuação (atleta, treinador ou olheiro), pódios e marcas.
- O perfil esportivo será público; e-mail e informações de acesso não aparecerão na busca nem no perfil.
- Atleta, treinador e olheiro serão descrições do perfil, não permissões administrativas.

## 2. Substituir os dados demonstrativos
- Remover pessoas, eventos, posts, contagens e imagens de publicações fictícias; não criar conteúdo falso para preencher a tela.
- Manter apenas listas de referência, como cidades e modalidades. A foto de capa poderá continuar como imagem ilustrativa da identidade do site.
- Quando ainda não houver conteúdo, mostrar estados vazios discretos com a ação relevante.
- Visitantes poderão consultar feed, eventos, busca e perfis; publicar e interagir exigirá entrar na conta.

## 3. Funções reais
- Feed: publicar, editar e excluir as próprias publicações, enviar fotos, curtir/descurtir e comentar.
- Comentários: remover os próprios comentários.
- Perfis: editar currículo esportivo e seguir/deixar de seguir pessoas, com contagens reais.
- Eventos: criar, editar e excluir os próprios eventos, consultar detalhes e registrar/cancelar inscrição.
- Organizador poderá consultar os participantes de seus eventos; listas de participantes não serão públicas.
- Aplicar limite de vagas e evitar inscrições e curtidas duplicadas, inclusive com solicitações simultâneas.
- Busca e filtros usarão os dados salvos, por cidade e modalidade.
- Valores de inscrição serão informativos; pagamento online não entra nesta etapa.

## 4. Segurança e conferência
- Validar os dados enviados e restringir alterações ao dono do perfil, publicação ou evento.
- Proteger fotos enviadas com regras de propriedade, tipo de arquivo e tamanho.
- Confirmar que cadastro e login funcionam com as configurações reais de confirmação de e-mail.
- Testar criação de perfil, publicação, curtida, comentário, evento e inscrição usando contas reais de teste; verificar os dados após recarregar.
- Testar que uma pessoa não altera os dados de outra e que a inscrição respeita as vagas. Remover o conteúdo de teste ao terminar.

## 5. Entrega para Antigravity + Claude Sonnet
- Entregar um ZIP limpo com código-fonte, imagens usadas, dependências declaradas, migrações do banco, exemplo de configuração sem segredos e instruções para rodar o site fora do Lovable.
- Incluir um guia de continuidade e um prompt para o Claude Sonnet: funcionalidades existentes, contratos de dados, acesso seguro e tarefas para criar o app.
- Separar regras e validações da apresentação web para facilitar seu reaproveitamento no React Native.
- Documentar como o futuro app acessará o mesmo Lovable Cloud e como configurar sessões e retornos de login no celular.
- O ZIP não leva senhas, chaves privadas, contas ou dados pessoais do banco.

**Limite desta etapa:** o site e seu backend serão implementados aqui. O app React Native será criado depois no Antigravity; não é uma conversão automática das telas HTML.

## Detalhes técnicos
- Manter React 19 + TanStack Start no site; não trocar o framework nem criar um projeto nativo neste ambiente.
- Organizar tipos e validações independentes de React/DOM, acesso a dados separado e componentes web reutilizando Shell, Button e os tokens atuais.
- Usar consultas reais com TanStack Query e loaders; remover o armazenamento de demonstração em memória e o usuário fixo `joao`.
- Criar tabelas de perfis, pódios, marcas, posts, curtidas, comentários, seguidores, eventos e inscrições, com chaves estrangeiras, índices, permissões explícitas e políticas de acesso por usuário.
- Criar automaticamente o perfil na abertura da conta; expor apenas dados esportivos públicos nas consultas públicas.
- Operações internas do site usarão funções de servidor autenticadas quando necessário; regras transacionais e permissões ficarão no banco para serem compartilhadas pelo futuro app.
- O app poderá usar o cliente de dados/autenticação com sessão própria e as mesmas políticas; não dependerá do protocolo interno de funções do TanStack. Se alguma operação exigir HTTP próprio, documentar uma API estável com validação da sessão no servidor.
- Entregar migrações e documentação de portabilidade, deixando explícitos os ajustes de hospedagem, variáveis de ambiente e URLs de autenticação ao sair do Lovable.