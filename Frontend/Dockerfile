ARG NODE_VERSION=20.18.0
ARG PNPM_VERSION=9.15.0

#######
# Base stage
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

# Build stage
FROM base AS build

ARG VITE_API_BASE_URL=http://localhost:5190
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Cài đặt đầy đủ dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Final stage
FROM nginx:alpine AS final

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose cổng 80 của Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]