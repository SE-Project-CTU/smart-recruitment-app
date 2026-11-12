# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.18.0
ARG PNPM_VERSION=9.15.0

# ==========================================
# STAGE 1: BUILD
# ==========================================
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

RUN npm install -g pnpm@${PNPM_VERSION}

ARG VITE_API_BASE_URL=http://localhost:5190
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG VITE_FIREBASE_API_KEY=""
ARG VITE_FIREBASE_AUTH_DOMAIN=""
ARG VITE_FIREBASE_PROJECT_ID=""
ARG VITE_FIREBASE_STORAGE_BUCKET=""
ARG VITE_FIREBASE_MESSAGING_SENDER_ID=""
ARG VITE_FIREBASE_APP_ID=""
ARG VITE_FIREBASE_MEASUREMENT_ID=""

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --force

COPY . .
RUN pnpm run build

# ==========================================
# STAGE 2: PRODUCTION WEBSERVER (NGINX)
# ==========================================
FROM nginx:alpine AS final

# Cấu hình Nginx cơ bản hỗ trợ Client-side Routing (React/Vite)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]