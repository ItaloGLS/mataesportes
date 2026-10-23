# ==============================================================================
# Dockerfile para Atletar (React 19 + TanStack Start + Vite)
# Runtime leve e de alta performance usando Bun
# ==============================================================================

FROM oven/bun:1-alpine AS base

WORKDIR /app

# Instala dependências do sistema necessárias para compilação nativa
RUN apk add --no-cache libc6-compat

# Copia manifestos de dependência
COPY package.json bun.lock* ./

# Instala dependências do projeto
RUN bun install

# Copia o código-fonte da aplicação
COPY . .

# Expõe a porta padrão do Vite / TanStack Start
EXPOSE 5173 3000

# Variáveis padrão de ambiente para Docker
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=5173

# Comando padrão de inicialização com binding para acesso externo
CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
