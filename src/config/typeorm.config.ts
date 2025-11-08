import { config } from "dotenv";
import * as path from "path";
import { DataSource } from "typeorm";

// Загружаем env файлы в правильном порядке
const nodeEnv = process.env.NODE_ENV || "development";
config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });
config({ path: path.resolve(process.cwd(), ".env") });

const AppDataSource = new DataSource({
  type: "postgres",
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  synchronize: false,
  entities: ["**/*.entity.ts"],
  migrations: ["src/database/migrations/*-migration.ts"],
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;
