<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# dev запуск

npm run start:dev

# Запуск через docker compose

docker-compose up

# Билд докера

docker-compose build

# Просмотр приложения, которое заняло порт порта

lsof -i :5432

# Миграция запуск и откат

npx sequelize-cli db:migrate --config src/config/sequelize-cli-config.js

npx sequelize-cli db:migrate:undo --config src/config/sequelize-cli-config.js
