FROM node:20-bookworm-slim

WORKDIR /app

COPY photo-service/package.json ./
RUN npm install --omit=dev

COPY photo-service/server.mjs ./

ENV PORT=4001
ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_USER=assezero
ENV MYSQL_PASSWORD=appsecret
ENV MYSQL_DATABASE=photos_svc
ENV JWT_SECRET=dev_jwt_secret_change_in_production

EXPOSE 4001
CMD ["node", "server.mjs"]
