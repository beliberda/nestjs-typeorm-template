import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

import { Observable } from "rxjs";
import { UserTokenDto } from "src/auth/dto/userToken.dto";
import { ROLES_KEY } from "src/auth/roles-auth.decorator";

@Injectable()
// Класс проверяющий права доступа к методам
export class RolesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true; // Если нет ролей, то пропускаем проверку
    }

    const req = context.switchToHttp().getRequest();

    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(" ")[0];
      const token = authHeader.split(" ")[1];
      if (bearer !== "Bearer" || !token) {
        throw new UnauthorizedException({
          message: "Пользователь не авторизован",
        });
      }
      const user: UserTokenDto = this.jwtService.verify(token);
      req.user = user;

      // есть ли у пользователя для этого endpoint роль
      const userRoles = user.roles || [];
      return requiredRoles.some((role) => userRoles.includes(role));
    } catch (e) {
      throw new HttpException(
        "У вас недостаточно прав доступа",
        HttpStatus.FORBIDDEN
      );
    }
  }
}
