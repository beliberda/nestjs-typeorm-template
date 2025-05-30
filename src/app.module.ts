import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users/users.module";

import { ServeStaticModule } from "@nestjs/serve-static";
import { AuthModule } from "./auth/auth.module";
import { FilesModule } from "./files/files.module";

import * as path from "path";

import { MulterModule } from "@nestjs/platform-express";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Client } from "src/client/client.entity";
import { Country } from "src/country/country.entity";
import { ManagmentInfo } from "src/managment-info/managment-info.entity";
import { Material } from "src/material/material.entity";
import { LoggerMiddleware } from "src/middlewares/LoggerMiddleware";
import { User } from "src/users/user.entity";


@Module({
  controllers: [],
  providers: [],
  //   Когда хотим в один модуль импортировать другие модули (например для работы с бд sequalize)
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    MulterModule.register({
      dest: "../uploads", // Временная папка для хранения файлов
      limits: {
        fileSize: 100 * 1024 * 1024, // Лимит размера файла 100MB
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, "..", "uploads"), // Указываем путь к папке uploads
      serveRoot: "/uploads", // Базовый URL для доступа к файлам
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Client, Country, Material, File, ManagmentInfo],
      synchronize: false,
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    FilesModule,
   
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "/tests", method: RequestMethod.POST });
  }
}
