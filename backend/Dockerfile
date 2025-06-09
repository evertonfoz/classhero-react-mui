# backend/Dockerfile.dev
FROM node:20

WORKDIR /app

# Instala dependências primeiro para aproveitar cache
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copia o restante do código
COPY . .

# Evita build desnecessário — vai rodar em tempo real
# Não roda `npm run build`

# Expõe a porta usada pelo NestJS
EXPOSE 3000

# Hot reload com Nest CLI
CMD ["npm", "run", "start:dev"]
