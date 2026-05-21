# Nginx API gateway only. The public frontend is built and served by Vercel.
FROM nginx:1.27-alpine

COPY docker/nginx.docker.conf /etc/nginx/conf.d/default.conf
