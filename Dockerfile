FROM nginx:1.17.1-alpine
COPY /dist/sars-cov2-data-upload /usr/share/nginx/html
