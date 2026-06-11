FROM node:20-bookworm-slim

WORKDIR /app

COPY photo-service/package.json ./
RUN npm install --omit=dev

COPY photo-service/server.mjs ./

# Non-secret runtime defaults (safe to bake into image)
ENV PORT=4001
ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_DATABASE=photos_svc
# MYSQL_USER, MYSQL_PASSWORD, JWT_SECRET must be injected at runtime via docker-compose + .env

EXPOSE 4001
CMD ["node", "server.mjs"]
