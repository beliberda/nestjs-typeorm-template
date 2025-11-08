<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# NestJS TypeORM Template

Готовый шаблон для быстрого развертывания NestJS приложения с TypeORM, JWT авторизацией, динамической системой ролей, файловым хранилищем (локальное/S3), логированием, бэкапами БД и Swagger документацией.

## Возможности

- ✅ JWT авторизация (access + refresh tokens)
- ✅ Динамическая система ролей (Many-to-Many)
- ✅ Файловое хранилище (локальное или S3-совместимое)
- ✅ Логирование с ротацией (Winston + daily-rotate-file)
- ✅ Автоматические бэкапы БД (ручные и по расписанию)
- ✅ Swagger документация
- ✅ Health Check endpoint
- ✅ Rate Limiting
- ✅ Глобальная обработка ошибок
- ✅ PM2 конфигурация для production

## Требования

- Node.js >= 18.x
- PostgreSQL >= 12.x
- npm или yarn
- PM2 (для production развертывания)

## Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd nestjs-typeorm-template

# Установка зависимостей
npm install
```

## Настройка окружения

1. Скопируйте файл `env.example` в `.env.development` и `.env.production`:

```bash
cp env.example .env.development
cp env.example .env.production
```

2. Заполните переменные окружения в файлах `.env.development` и `.env.production`:

```env
# Server
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# JWT
JWT_ACCESS_SECRET=your-access-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# Storage (local or s3)
STORAGE_TYPE=local
# S3 Configuration (if STORAGE_TYPE=s3)
S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-s3-access-key
S3_SECRET_ACCESS_KEY=your-s3-secret-key
S3_BUCKET_NAME=your-bucket-name
S3_FORCE_PATH_STYLE=false

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
LOG_MAX_SIZE=20m
LOG_MAX_FILES=30d

# Backup
BACKUP_DIR=./backups
BACKUP_SCHEDULE=0 2 * * *
```

## Запуск приложения

### Development режим

```bash
# Запуск с hot-reload
npm run start:dev

# Запуск в обычном режиме
npm run start
```

### Production режим

```bash
# Сборка проекта
npm run build

# Запуск собранного приложения
npm run start:prod
```

## Развертывание с PM2

### Установка PM2

```bash
npm install -g pm2
```

### Запуск через PM2

```bash
# Development
npm run pm2:start

# Production
npm run pm2:start:prod
```

### Управление приложением

```bash
# Остановка
npm run pm2:stop

# Перезапуск
npm run pm2:restart

# Просмотр логов
npm run pm2:logs

# Мониторинг
npm run pm2:monit

# Удаление из PM2
npm run pm2:delete
```

### Автозапуск после перезагрузки сервера

```bash
# Сохранение текущей конфигурации PM2
pm2 save

# Настройка автозапуска
pm2 startup
# Выполните команду, которую выведет PM2
```

## Миграции базы данных

### Создание миграции

```bash
# Development
npm run migration:create

# Production
npm run migration:prod:create
```

### Генерация миграции из изменений entities

```bash
# Development
npm run migration:generate

# Production
npm run migration:prod:generate
```

### Применение миграций

```bash
# Development
npm run migration:run

# Production
npm run migration:prod:run
```

### Откат миграций

```bash
# Development
npm run migration:revert

# Production
npm run migration:prod:revert
```

## Создание суперпользователя

```bash
# Development
npm run create-superuser

# Production
npm run create-superuser:prod
```

## Docker

### Запуск через Docker Compose

```bash
# Запуск контейнеров
docker-compose up

# Запуск в фоновом режиме
docker-compose up -d

# Остановка
docker-compose down

# Пересборка образов
docker-compose build
```

### Просмотр приложения, использующего порт

```bash
# Linux/Mac
lsof -i :5432

# Windows
netstat -ano | findstr :5432
```

## API Документация

После запуска приложения Swagger документация доступна по адресу:

```
http://localhost:5000/api/docs
```

Для доступа к защищенным endpoints используйте кнопку "Authorize" в Swagger UI и введите JWT токен в формате:

```
Bearer <your-access-token>
```

## Структура проекта

```
src/
├── auth/              # Модуль авторизации (JWT)
├── users/             # Модуль пользователей
├── roles/             # Модуль ролей
├── files/             # Модуль работы с файлами
├── database/          # Миграции, сидеры, бэкапы
├── config/            # Конфигурационные файлы
├── common/            # Общие модули (filters, interceptors)
├── health/            # Health check endpoints
├── enums/             # Перечисления
├── middlewares/       # Middleware
├── pipes/             # Validation pipes
└── main.ts            # Точка входа
```

## Основные endpoints

### Авторизация

- `POST /auth/login` - Вход в систему
- `POST /auth/registration` - Регистрация (требует роль ADMIN или TEACHER)
- `POST /auth/refresh` - Обновление access токена
- `POST /auth/logout` - Выход из системы

### Пользователи

- `GET /users` - Список пользователей (ADMIN)
- `POST /users` - Создание пользователя (ADMIN)
- `PUT /users/:id` - Обновление пользователя (ADMIN)
- `DELETE /users/:id` - Удаление пользователя (ADMIN)
- `POST /users/ban` - Блокировка пользователя (ADMIN)

### Роли

- `GET /roles` - Список ролей
- `GET /roles/:id` - Получение роли по ID
- `POST /roles` - Создание роли (ADMIN)
- `PUT /roles/:id` - Обновление роли (ADMIN)
- `DELETE /roles/:id` - Удаление роли (ADMIN)
- `POST /roles/assign` - Назначение роли пользователю (ADMIN)
- `POST /roles/remove` - Удаление роли у пользователя (ADMIN)

### Бэкапы

- `GET /backups` - Список бэкапов (ADMIN)
- `POST /backups` - Создание бэкапа (ADMIN)
- `DELETE /backups/:fileName` - Удаление бэкапа (ADMIN)
- `POST /backups/restore/:fileName` - Восстановление из бэкапа (ADMIN)

### Health Check

- `GET /health` - Проверка состояния приложения и БД

## Логирование

Логи сохраняются в директории `./logs`:

- `application-YYYY-MM-DD.log` - общие логи
- `error-YYYY-MM-DD.log` - только ошибки
- `pm2-error.log` - ошибки PM2
- `pm2-out.log` - вывод PM2

Настройки логирования можно изменить через переменные окружения:

- `LOG_LEVEL` - уровень логирования (error, warn, info, debug)
- `LOG_DIR` - директория для логов
- `LOG_MAX_SIZE` - максимальный размер файла (например, 20m)
- `LOG_MAX_FILES` - время хранения логов (например, 30d)

## Бэкапы базы данных

### Ручное создание бэкапа

Через API endpoint `POST /backups` (требует роль ADMIN)

### Автоматические бэкапы

Настраиваются через переменную окружения `BACKUP_SCHEDULE` в формате cron:

- `0 2 * * *` - ежедневно в 2:00
- `0 */6 * * *` - каждые 6 часов
- `0 0 * * 0` - еженедельно в воскресенье

Бэкапы сохраняются в директории, указанной в `BACKUP_DIR`.

## Хранилище файлов

### Локальное хранилище

По умолчанию используется локальное хранилище. Файлы сохраняются в директории `./uploads`.

### S3 хранилище

Для использования S3-совместимого хранилища (AWS S3, Yandex Object Storage, MinIO):

1. Установите `STORAGE_TYPE=s3` в `.env`
2. Заполните S3 credentials:
   - `S3_ENDPOINT` - endpoint хранилища
   - `S3_REGION` - регион
   - `S3_ACCESS_KEY_ID` - ключ доступа
   - `S3_SECRET_ACCESS_KEY` - секретный ключ
   - `S3_BUCKET_NAME` - имя bucket
   - `S3_FORCE_PATH_STYLE` - для MinIO установите `true`

## Безопасность

- Все пароли хешируются с помощью bcrypt
- JWT токены с настраиваемым временем жизни
- Rate limiting для защиты от DDoS
- Валидация всех входящих данных
- Глобальная обработка ошибок

## Скрипты

- `npm run build` - сборка проекта
- `npm run start:dev` - запуск в development режиме с hot-reload
- `npm run start:prod` - запуск production версии
- `npm run lint` - проверка кода линтером
- `npm run test` - запуск тестов
- `npm run format` - форматирование кода

## Troubleshooting

### Ошибка подключения к БД

Проверьте:

1. Правильность настроек в `.env.development` или `.env.production`
2. Запущен ли PostgreSQL сервер
3. Доступность хоста и порта БД

### Ошибка "client password must be a string"

Убедитесь, что `POSTGRES_PASSWORD` установлен в файле окружения и не пустой.

### PM2 не запускает приложение

1. Убедитесь, что проект собран: `npm run build`
2. Проверьте путь к скрипту в `pm2.config.json` (должен быть `build/main.js`)
3. Проверьте логи: `npm run pm2:logs`

## Лицензия

UNLICENSED
