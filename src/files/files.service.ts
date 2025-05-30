import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";
import * as path from "path";
import { File } from "src/files/file.entity";
import { Repository } from "typeorm";
import * as uuid from "uuid";

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRespository: Repository<File>
  ) {}

  async createFile(file: Express.Multer.File) {
    try {
      const fileName = await this.saveFile(file); // Сохраняем файл и получаем его имя
      const newFile = this.fileRespository.create({
        fileName,
        fileShortType: file.mimetype.split("/")[0], // Получаем тип файла (например, "image" из "image/png")
        fileType: file.mimetype, // Полный тип файла (например, "image/png")
        fileUrl: "/uploads/" + fileName, // URL файла для доступа
      });
      return await this.fileRespository.save(newFile); // Сохраняем запись в базе данных
    } catch (error) {
      throw new HttpException(
        "Ошибка при сохранении файла",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      // Генерация уникального имени файла
      const fileName = uuid.v4() + path.extname(file.originalname);
      const filePath = path.resolve(__dirname, "../../", "uploads");
      // Проверяем, существует ли директория, если нет, создаем ее
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      // Путь к файлу
      const fullPath = path.join(filePath, fileName);

      // Сохраняем файл на диск
      fs.writeFileSync(fullPath, file.buffer);

      return process.env.API_URL + "/uploads/" + fileName; // Возвращаем имя файла
    } catch (error) {
      throw new HttpException(
        "Ошибка при записи файла",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async removeFile(fileName: string): Promise<void> {
    try {
      const filePath = path.resolve(__dirname, "../../", "uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Удаляем файл
      } else {
        throw new HttpException("Файл не найден", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        "Ошибка при удалении файла",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
