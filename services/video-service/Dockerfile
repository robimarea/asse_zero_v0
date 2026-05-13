FROM node:20-bookworm-slim

WORKDIR /app

COPY video-service/package.json ./
RUN npm install --omit=dev

COPY video-service/server.mjs ./

ENV PORT=4002
ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_USER=assezero
ENV MYSQL_PASSWORD=appsecret
ENV MYSQL_DATABASE=videos_svc

EXPOSE 4002
CMD ["node", "server.mjs"]
