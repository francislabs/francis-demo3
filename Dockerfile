FROM node:22-alpine

ARG APP_VERSION=dev
ARG GIT_SHA=local
ENV NODE_ENV=production \
    PORT=8080 \
    APP_VERSION=${APP_VERSION} \
    GIT_SHA=${GIT_SHA}

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src

# Run as the non-root user that ships with the node image
USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["node", "src/server.js"]
