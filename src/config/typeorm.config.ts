import { DataSource } from "typeorm";
import { config } from "dotenv";
require("dotenv").config({ path: `./.${process.env.NODE_ENV}.env` });
config();

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
