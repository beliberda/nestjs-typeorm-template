import { Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Files:", req.files); // Логируем файлы
    next();
  }
}
