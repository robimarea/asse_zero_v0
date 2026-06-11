FROM node:20-bookworm-slim

WORKDIR /app

COPY video-service/package.json ./
RUN npm install --omit=dev

COPY video-service/server.mjs ./

# Non-secret runtime defaults (safe to bake into image)
ENV PORT=4002
ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_DATABASE=videos_svc
# MYSQL_USER, MYSQL_PASSWORD must be injected at runtime via docker-compose + .env

EXPOSE 4002
CMD ["node", "server.mjs"]
