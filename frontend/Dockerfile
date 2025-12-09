# Use the official NGINX image
FROM nginx:alpine

WORKDIR /usr/share/nginx/html
# Copy your static website files into the container

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx configuration FIRST
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./frontend/ /usr/share/nginx/html/
VOLUME ["usr/share/nginx/html"]
# Expose port 80
EXPOSE 80

# The default CMD from nginx:alpine already starts NGINX

CMD ["nginx","-g","daemon off;" ]
