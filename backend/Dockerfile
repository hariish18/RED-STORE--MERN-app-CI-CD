FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production \PORT=1980

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

COPY --chmod=755 docker-entrypoint.sh  /usr/local/bin/docker-entrypoint.sh
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}

EXPOSE 1980

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" 

USER node

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node","server.js"]