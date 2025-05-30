import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { File } from "src/files/file.entity";
import { FilesService } from "./files.service";

@Module({
  providers: [FilesService],
  exports: [FilesService],
  imports: [TypeOrmModule.forFeature([File])],
})
export class FilesModule {}
