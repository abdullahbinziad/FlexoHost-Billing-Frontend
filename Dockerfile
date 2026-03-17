FROM node:22.12.0-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:22.12.0-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22.12.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
# If your project uses next.config.mjs instead, change the above line.

EXPOSE 3000

CMD ["npm", "start"]