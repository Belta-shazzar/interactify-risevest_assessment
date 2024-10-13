# --- Base

FROM node:20-alpine as base

ENV NODE_ENV=development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY  . .

# --- Unit Test

FROM base as test

# Using NODE_ENV=test for testing
ENV NODE_ENV=test

RUN npm run test

# --- Build

FROM base as builder

RUN npm run prisma:generate

RUN npm run build

# --- Production

FROM node:20-alpine as production

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy only production build and necessary files
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules/
COPY --from=builder /usr/src/app/dist ./dist/
COPY --from=builder /usr/src/app/.env ./

# Remove devDependencies
RUN npm prune --production

# Ensure entrypoint.sh is available
COPY ./entrypoint.sh ./entrypoint.sh

# Make entrypoint.sh executable
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

CMD ["sh", "./entrypoint.sh"]
