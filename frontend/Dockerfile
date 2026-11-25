FROM node:22-alpine AS dependencies
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM dependencies AS build
WORKDIR /app/frontend
COPY frontend/ ./
COPY src/ /app/src/
ARG NEXT_PUBLIC_API_BASE_URL=
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/frontend/.next/standalone ./
COPY --from=build --chown=app:app /app/frontend/.next/static ./.next/static
USER app
EXPOSE 3000
HEALTHCHECK --interval=20s --timeout=5s --start-period=20s --retries=5 CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
