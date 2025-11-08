import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { File } from "src/files/file.entity";
import { FilesService } from "./files.service";
import { LocalStorageService } from "./local-storage.service";
import { S3StorageService } from "./s3-storage.service";
import { IStorage } from "./storage.interface";

@Module({
  providers: [
    FilesService,
    {
      provide: "STORAGE_SERVICE",
      useFactory: (configService: ConfigService): IStorage => {
        const storageType =
          configService.get<string>("STORAGE_TYPE") || "local";

        if (storageType === "s3") {
          return new S3StorageService(configService);
        }

        return new LocalStorageService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [FilesService],
  imports: [TypeOrmModule.forFeature([File]), ConfigModule],
})
export class FilesModule {}
