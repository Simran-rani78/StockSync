# Stage 1: Build source assets
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install modules using peer deps flag
RUN npm install --legacy-peer-deps

COPY . .

# Set default API variable during compilation
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: Serve compiled HTML/JS over Nginx web server
FROM nginx:1.25-alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Wire custom config for React Router URL handling
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
