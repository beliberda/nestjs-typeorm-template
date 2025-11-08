import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Roles } from "src/auth/roles-auth.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { BackupService } from "./backup.service";

@ApiTags("Бэкапы базы данных")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("backups")
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @ApiOperation({ summary: "Создать бэкап базы данных" })
  @ApiResponse({
    status: 201,
    description: "Бэкап успешно создан",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
        path: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 500, description: "Ошибка при создании бэкапа" })
  @Post()
  async createBackup() {
    try {
      const backupPath = await this.backupService.createBackup();
      return {
        message: "Бэкап успешно создан",
        path: backupPath,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: "Получить список всех бэкапов" })
  @ApiResponse({
    status: 200,
    description: "Список бэкапов",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          path: { type: "string" },
          size: { type: "number" },
          created: { type: "string", format: "date-time" },
        },
      },
    },
  })
  @Get()
  async listBackups() {
    try {
      return await this.backupService.listBackups();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: "Удалить бэкап" })
  @ApiResponse({ status: 200, description: "Бэкап успешно удален" })
  @ApiResponse({ status: 404, description: "Бэкап не найден" })
  @ApiParam({ name: "fileName", description: "Имя файла бэкапа" })
  @Delete(":fileName")
  async deleteBackup(@Param("fileName") fileName: string) {
    try {
      await this.backupService.deleteBackup(fileName);
      return { message: "Бэкап успешно удален" };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.message.includes("не найден")
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: "Восстановить базу данных из бэкапа" })
  @ApiResponse({
    status: 200,
    description: "База данных успешно восстановлена",
  })
  @ApiResponse({ status: 404, description: "Бэкап не найден" })
  @ApiResponse({ status: 500, description: "Ошибка при восстановлении" })
  @ApiParam({ name: "fileName", description: "Имя файла бэкапа" })
  @Post("restore/:fileName")
  async restoreBackup(@Param("fileName") fileName: string) {
    try {
      await this.backupService.restoreBackup(fileName);
      return { message: "База данных успешно восстановлена из бэкапа" };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.message.includes("не найден")
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
