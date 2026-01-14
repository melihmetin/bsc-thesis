FROM node:18.12 AS build

WORKDIR /app
COPY ./package*.json ./
RUN npm ci

COPY ./ ./
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.23-alpine

COPY --from=build /app/dist /usr/share/nginx/html/
