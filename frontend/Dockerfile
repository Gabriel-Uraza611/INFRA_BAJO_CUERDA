
FROM nginx:alpine

WORKDIR /app/frontend

RUN rm -rf /usr/share/nginx/html/*

COPY frontend/ /usr/share/nginx/html/

EXPOSE 80
