import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { BackupSchedulerService } from "./backup-scheduler.service";
import { BackupController } from "./backup.controller";
import { BackupService } from "./backup.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    forwardRef(() => AuthModule),
  ],
  controllers: [BackupController],
  providers: [BackupService, BackupSchedulerService],
  exports: [BackupService],
})
export class BackupModule {}
