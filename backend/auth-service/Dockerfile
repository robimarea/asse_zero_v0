FROM node:20-bookworm-slim

WORKDIR /app

COPY auth-service/package.json ./
RUN npm install --omit=dev

COPY auth-service/server.mjs ./

# Non-secret runtime defaults (safe to bake into image)
ENV PORT=4003
ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_DATABASE=auth_svc
# MYSQL_USER, MYSQL_PASSWORD, JWT_SECRET must be injected at runtime via docker-compose + .env

EXPOSE 4003
CMD ["node", "server.mjs"]
