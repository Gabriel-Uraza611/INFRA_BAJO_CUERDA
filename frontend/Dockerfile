# Use the official NGINX image
FROM nginx:alpine

WORKDIR /usr/share/nginx/html
# Copy your static website files into the container
COPY ./frontend/ .

VOLUME ["usr/share/nginx/html"]
# Expose port 80
EXPOSE 80

# The default CMD from nginx:alpine already starts NGINX

CMD ["nginx","-g","daemon off;" ]
