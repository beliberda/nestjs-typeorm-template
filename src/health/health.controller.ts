import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";

@ApiTags("Health Check")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Проверка состояния приложения" })
  @ApiResponse({
    status: 200,
    description: "Приложение работает нормально",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        info: {
          type: "object",
          properties: {
            database: {
              type: "object",
              properties: {
                status: { type: "string", example: "up" },
              },
            },
          },
        },
      },
    },
  })
  check() {
    return this.health.check([() => this.db.pingCheck("database")]);
  }
}
