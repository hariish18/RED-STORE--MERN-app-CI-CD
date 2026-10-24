#---stage 1 VITE Build-----

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=""
ARG VITE_STRIPE_PUBLISHABLE_KEY=""

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}

RUN npm run build


#----- sTAGE 2 NGINX------------

FROM nginx:alpine
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
