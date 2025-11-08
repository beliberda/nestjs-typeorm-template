import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";

import { ServeStaticModule } from "@nestjs/serve-static";
import { AuthModule } from "./auth/auth.module";
import { FilesModule } from "./files/files.module";

import * as path from "path";

import { MulterModule } from "@nestjs/platform-express";
import { TypeOrmModule } from "@nestjs/typeorm";

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerMiddleware } from "src/middlewares/LoggerMiddleware";
import { User } from "src/users/user.entity";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { LoggerModule } from "./common/logger.module";
import { BackupModule } from "./database/backup.module";
import { File } from "./files/file.entity";
import { HealthModule } from "./health/health.module";
import { Role } from "./roles/role.entity";
import { RolesModule } from "./roles/roles.module";

@Module({
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    LoggerModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 минута
        limit: 100, // 100 запросов
      },
    ]),
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV || "development"}`, ".env"],
      isGlobal: true,
      // validate: validate, // Раскомментировать для валидации ENV
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("POSTGRES_HOST"),
        port: configService.get<number>("POSTGRES_PORT"),
        username: configService.get("POSTGRES_USER"),
        password: configService.get("POSTGRES_PASSWORD"),
        database: configService.get("POSTGRES_DB"),
        entities: [User, File, Role],
        synchronize: false,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    FilesModule,
    RolesModule,
    BackupModule,
    HealthModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "/tests", method: RequestMethod.POST });
  }
}
