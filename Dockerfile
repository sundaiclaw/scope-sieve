FROM node:22-slim
WORKDIR /app
COPY package.json server.js ./
EXPOSE 8080
CMD ["npm","run","start"]
