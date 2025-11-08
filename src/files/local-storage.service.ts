import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import * as uuid from "uuid";
import { IStorage } from "./storage.interface";

@Injectable()
export class LocalStorageService implements IStorage {
  private readonly uploadsDir: string;

  constructor(private configService: ConfigService) {
    this.uploadsDir = path.resolve(process.cwd(), "uploads");
    // Создаем директорию, если её нет
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileName = uuid.v4() + path.extname(file.originalname);
      const filePath = path.join(this.uploadsDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      const apiUrl =
        this.configService.get<string>("API_URL") || "http://localhost:5000";
      return `${apiUrl}/uploads/${fileName}`;
    } catch (error) {
      throw new Error(`Ошибка при сохранении файла: ${error.message}`);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      // Извлекаем имя файла из URL, если передан полный URL
      const fileNameOnly = fileName.includes("/")
        ? fileName.split("/").pop()
        : fileName;
      if (!fileNameOnly) {
        throw new Error("Некорректное имя файла: " + fileName);
      }
      const filePath = path.join(this.uploadsDir, fileNameOnly);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        throw new Error(`Файл ${fileNameOnly} не найден`);
      }
    } catch (error) {
      throw new Error(`Ошибка при удалении файла: ${error.message}`);
    }
  }

  getFileUrl(fileName: string): string {
    const apiUrl =
      this.configService.get<string>("API_URL") || "http://localhost:5000";
    const fileNameOnly = fileName.includes("/")
      ? fileName.split("/").pop()
      : fileName;
    return `${apiUrl}/uploads/${fileNameOnly}`;
  }
}
