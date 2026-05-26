FROM node:20-bookworm-slim

WORKDIR /app

COPY auth-service/package.json ./
RUN npm install --omit=dev

COPY auth-service/server.mjs ./

ENV PORT=4003
ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_USER=assezero
ENV MYSQL_PASSWORD=appsecret
ENV MYSQL_DATABASE=auth_svc
ENV JWT_SECRET=dev_jwt_secret_change_in_production

EXPOSE 4003
CMD ["node", "server.mjs"]
