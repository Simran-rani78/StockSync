# Stage 1: Dependency builder
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install production-only dependencies
RUN npm ci --only=production

# Stage 2: Execution runtime
FROM node:20-alpine

WORKDIR /usr/src/app

# Pull dependencies and source code
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY .sequelizerc ./
COPY src ./src

# Ensure local storage fallback upload folder exists
RUN mkdir -p uploads

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["npm", "start"]
