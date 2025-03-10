# Stage 1: Build the React Application
FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN yarn install --production
COPY . .
RUN yarn build

# Stage 2: Setup the Nginx Server to serve the React Application
FROM nginx:1.25.0-alpine as production
COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]