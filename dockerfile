FROM node:18 AS build

WORKDIR /app

# Definir argumentos de construcción
ARG VITE_API_BASE_URL
ARG VITE_DOCS_API_URL

# Configurar las variables de entorno
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DOCS_API_URL=$VITE_DOCS_API_URL

COPY package*.json ./
RUN npm install

COPY . .

# Construir la aplicación con Vite
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]