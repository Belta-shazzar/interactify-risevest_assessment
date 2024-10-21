# --- Base

FROM node:20-alpine AS base

ENV NODE_ENV=development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY  . .

# --- Build

FROM base AS builder

RUN npm run prisma:generate

RUN npm run build

# --- Production

FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

## Install production dependencies inside the container
COPY package*.json ./
RUN npm install --production

# Copy only production build and necessary files
COPY --from=builder /usr/src/app/dist ./dist/

# Ensure entrypoint.sh is available and executable
COPY ./entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

CMD ["sh", "./entrypoint.sh"]
