import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir: string;
  private readonly dbConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };

  constructor(private configService: ConfigService) {
    this.backupDir =
      this.configService.get<string>("BACKUP_DIR") || "./backups";
    this.dbConfig = {
      host: this.configService.get<string>("POSTGRES_HOST") || "localhost",
      port: this.configService.get<number>("POSTGRES_PORT") || 5432,
      user: this.configService.get<string>("POSTGRES_USER") || "postgres",
      password: this.configService.get<string>("POSTGRES_PASSWORD") || "",
      database: this.configService.get<string>("POSTGRES_DB") || "postgres",
    };

    // Создаем директорию для бэкапов, если её нет
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFileName = `backup-${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Формируем команду pg_dump
      const pgDumpCommand = `pg_dump -h ${this.dbConfig.host} -p ${this.dbConfig.port} -U ${this.dbConfig.user} -d ${this.dbConfig.database} -f ${backupPath}`;

      // Устанавливаем переменную окружения для пароля
      const env = {
        ...process.env,
        PGPASSWORD: this.dbConfig.password,
      };

      this.logger.log(`Создание бэкапа: ${backupFileName}`);

      await execAsync(pgDumpCommand, { env });

      this.logger.log(`Бэкап успешно создан: ${backupPath}`);

      return backupPath;
    } catch (error) {
      this.logger.error(`Ошибка при создании бэкапа: ${error.message}`);
      throw new Error(`Не удалось создать бэкап: ${error.message}`);
    }
  }

  async listBackups(): Promise<
    Array<{ name: string; path: string; size: number; created: Date }>
  > {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups = files
        .filter((file) => file.endsWith(".sql"))
        .map((file) => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      return backups;
    } catch (error) {
      this.logger.error(
        `Ошибка при получении списка бэкапов: ${error.message}`
      );
      throw new Error(`Не удалось получить список бэкапов: ${error.message}`);
    }
  }

  async deleteBackup(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.backupDir, fileName);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Бэкап ${fileName} не найден`);
      }

      fs.unlinkSync(filePath);
      this.logger.log(`Бэкап удален: ${fileName}`);
    } catch (error) {
      this.logger.error(`Ошибка при удалении бэкапа: ${error.message}`);
      throw new Error(`Не удалось удалить бэкап: ${error.message}`);
    }
  }

  async restoreBackup(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.backupDir, fileName);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Бэкап ${fileName} не найден`);
      }

      // Формируем команду psql для восстановления
      const psqlCommand = `psql -h ${this.dbConfig.host} -p ${this.dbConfig.port} -U ${this.dbConfig.user} -d ${this.dbConfig.database} -f ${filePath}`;

      const env = {
        ...process.env,
        PGPASSWORD: this.dbConfig.password,
      };

      this.logger.log(`Восстановление бэкапа: ${fileName}`);

      await execAsync(psqlCommand, { env });

      this.logger.log(`Бэкап успешно восстановлен: ${fileName}`);
    } catch (error) {
      this.logger.error(`Ошибка при восстановлении бэкапа: ${error.message}`);
      throw new Error(`Не удалось восстановить бэкап: ${error.message}`);
    }
  }
}
