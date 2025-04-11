FROM node:20.9.0

WORKDIR /app

COPY package*.json ./

RUN npm install && npx sequelize-cli db:migrate --config src/config/sequelize-cli-config.js

COPY . .

COPY ./build ./build

CMD ["node", "run", "start:dev"]
