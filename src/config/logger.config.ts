import { ConfigService } from "@nestjs/config";
import { WinstonModuleOptions } from "nest-winston";
import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";

export const createLoggerConfig = (
  configService: ConfigService
): WinstonModuleOptions => {
  const logLevel = configService.get<string>("LOG_LEVEL") || "info";
  const logDir = configService.get<string>("LOG_DIR") || "./logs";
  const maxSize = configService.get<string>("LOG_MAX_SIZE") || "20m";
  const maxFiles = configService.get<string>("LOG_MAX_FILES") || "30d";

  const dailyRotateFileTransport = new DailyRotateFile({
    filename: `${logDir}/application-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: maxSize,
    maxFiles: maxFiles,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  });

  const errorRotateFileTransport = new DailyRotateFile({
    filename: `${logDir}/error-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: maxSize,
    maxFiles: maxFiles,
    level: "error",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  });

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            (info) =>
              `${info.timestamp} [${info.level}]: ${info.message}${
                info.stack ? `\n${info.stack}` : ""
              }`
          )
        ),
      }),
      dailyRotateFileTransport,
      errorRotateFileTransport,
    ],
  };
};
