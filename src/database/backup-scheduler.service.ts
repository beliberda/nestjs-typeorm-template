import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { BackupService } from "./backup.service";

@Injectable()
export class BackupSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(BackupSchedulerService.name);

  constructor(
    private readonly backupService: BackupService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry
  ) {}

  onModuleInit() {
    const schedule =
      this.configService.get<string>("BACKUP_SCHEDULE") ||
      CronExpression.EVERY_DAY_AT_2AM;

    // Если указано кастомное расписание, создаем задачу с ним
    if (schedule && schedule !== CronExpression.EVERY_DAY_AT_2AM) {
      const job = new CronJob(schedule, async () => {
        this.logger.log("Запуск автоматического бэкапа по расписанию");
        try {
          await this.backupService.createBackup();
          this.logger.log("Автоматический бэкап успешно создан");
        } catch (error) {
          this.logger.error(
            `Ошибка при создании автоматического бэкапа: ${error.message}`
          );
        }
      });

      this.schedulerRegistry.addCronJob("backup", job);
      job.start();
      this.logger.log(
        `Автоматические бэкапы настроены по расписанию: ${schedule}`
      );
    } else {
      // Используем декоратор по умолчанию
      this.logger.log(
        `Автоматические бэкапы настроены по расписанию: ${CronExpression.EVERY_DAY_AT_2AM}`
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCron() {
    // Этот метод будет использоваться только если не указано кастомное расписание
    const customSchedule = this.configService.get<string>("BACKUP_SCHEDULE");
    if (customSchedule && customSchedule !== CronExpression.EVERY_DAY_AT_2AM) {
      return; // Кастомное расписание обрабатывается в onModuleInit
    }

    this.logger.log("Запуск автоматического бэкапа по расписанию");
    try {
      await this.backupService.createBackup();
      this.logger.log("Автоматический бэкап успешно создан");
    } catch (error) {
      this.logger.error(
        `Ошибка при создании автоматического бэкапа: ${error.message}`
      );
    }
  }
}
