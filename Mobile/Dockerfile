# Dockerfile para la aplicación móvil
# Ajusta la imagen base y los comandos según tu stack móvil (React Native, Expo, etc.)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
