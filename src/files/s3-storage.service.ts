import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as path from "path";
import * as uuid from "uuid";
import { IStorage } from "./storage.interface";

@Injectable()
export class S3StorageService implements IStorage {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>("S3_ENDPOINT");
    const region = this.configService.get<string>("S3_REGION") || "us-east-1";
    const accessKeyId =
      this.configService.get<string>("S3_ACCESS_KEY_ID") || "";
    const secretAccessKey = this.configService.get<string>(
      "S3_SECRET_ACCESS_KEY"
    );
    const forcePathStyle =
      this.configService.get<string>("S3_FORCE_PATH_STYLE") === "true";

    this.bucketName =
      this.configService.get<string>("S3_BUCKET_NAME") || "default-bucket";
    this.apiUrl =
      this.configService.get<string>("API_URL") || "http://localhost:5000";

    if (!accessKeyId || !secretAccessKey || !this.bucketName) {
      throw new Error(
        "S3 credentials не настроены. Проверьте переменные окружения."
      );
    }

    this.s3Client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    });
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileName = uuid.v4() + path.extname(file.originalname);
      const key = `uploads/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Возвращаем URL файла
      // Если используется кастомный endpoint (например, MinIO), формируем URL соответственно
      const endpoint = this.configService.get<string>("S3_ENDPOINT");
      if (endpoint && !endpoint.includes("amazonaws.com")) {
        // Для кастомных S3-совместимых хранилищ
        return `${endpoint}/${this.bucketName}/${key}`;
      }

      // Для AWS S3
      return `https://${this.bucketName}.s3.${this.configService.get<string>("S3_REGION") || "us-east-1"}.amazonaws.com/${key}`;
    } catch (error) {
      throw new Error(`Ошибка при сохранении файла в S3: ${error.message}`);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      // Извлекаем ключ из URL или используем как есть
      let key = fileName;
      if (fileName.includes("/")) {
        // Если передан полный URL, извлекаем путь
        const urlParts = fileName.split("/");
        const uploadsIndex = urlParts.findIndex((part) => part === "uploads");
        if (uploadsIndex !== -1) {
          key = urlParts.slice(uploadsIndex).join("/");
        } else {
          key = `uploads/${urlParts[urlParts.length - 1]}`;
        }
      } else {
        key = `uploads/${fileName}`;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Ошибка при удалении файла из S3: ${error.message}`);
    }
  }

  getFileUrl(fileName: string): string {
    // Если уже полный URL, возвращаем как есть
    if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
      return fileName;
    }

    const endpoint = this.configService.get<string>("S3_ENDPOINT");
    const key = fileName.includes("/") ? fileName : `uploads/${fileName}`;

    if (endpoint && !endpoint.includes("amazonaws.com")) {
      return `${endpoint}/${this.bucketName}/${key}`;
    }

    return `https://${this.bucketName}.s3.${this.configService.get<string>("S3_REGION") || "us-east-1"}.amazonaws.com/${key}`;
  }
}
