FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS api
WORKDIR /app
COPY . .
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8787
EXPOSE 8787
CMD ["node", "server/index.mjs"]

FROM dependencies AS frontend-build
WORKDIR /app
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS web
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
