FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install

COPY . .
RUN npm -w apps/api run build && npm -w apps/api run prisma:generate

EXPOSE 3333
CMD ["sh", "-c", "npx prisma migrate deploy --schema apps/api/prisma/schema.prisma && node apps/api/dist/main.js"]
