# Mata Esportes

Rede esportiva da Mata Sul de Pernambuco com dados reais e backend Lovable Cloud.

## Desenvolvimento

- Requisitos: Bun e Node compatível com Vite 8.
- Copie `.env.example` para `.env` e preencha localmente a conexão do ambiente autorizado.
- `bun install`
- `bun run dev -- --host 0.0.0.0 --port 8080`
- `bun run test`

O site continua em React 19 e TanStack Start. Os dados não são mockados: uma instalação vazia começa sem posts e eventos.

## Continuidade e app

Leia [docs/ANTIGRAVITY.md](docs/ANTIGRAVITY.md) para configuração fora do Lovable, contratos de dados, segurança, migrações e o prompt de continuidade para Claude Sonnet criar React Native sem quebrar o site.

A pasta `drizzle/migrations` contém apenas esquema e permissões, não contas ou dados pessoais. Credenciais administrativas e dados privados não são entregues.
