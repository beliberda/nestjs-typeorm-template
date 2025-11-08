import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { File } from "src/files/file.entity";
import { Repository } from "typeorm";
import { IStorage } from "./storage.interface";

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRespository: Repository<File>,
    @Inject("STORAGE_SERVICE")
    private readonly storageService: IStorage
  ) {}

  async createFile(file: Express.Multer.File) {
    try {
      const fileUrl = await this.storageService.saveFile(file);

      // Извлекаем имя файла из URL
      const fileName = fileUrl.split("/").pop() || fileUrl;

      const newFile = this.fileRespository.create({
        fileName,
        fileShortType: file.mimetype.split("/")[0],
        fileType: file.mimetype,
        fileUrl: fileUrl,
      });
      return await this.fileRespository.save(newFile);
    } catch (error) {
      throw new HttpException(
        `Ошибка при сохранении файла: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async removeFile(fileName: string): Promise<void> {
    try {
      await this.storageService.deleteFile(fileName);
    } catch (error) {
      throw new HttpException(
        `Ошибка при удалении файла: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
