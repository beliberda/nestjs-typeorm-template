import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService
  ) {}

  async use(req: any, res: Response, next: NextFunction) {
    const accessToken = this.extractAccessToken(req);
    const refreshToken = this.extractRefreshToken(req);

    // Пропускаем публичные маршруты

    if (this.isPublicRoute(req)) return next();

    try {
      if (accessToken) {
        // Проверяем access token
        const decoded = this.jwtService.verify(accessToken);
        req["user"] = decoded;
        return next();
      }
    } catch (accessError) {
      if (accessError.name === "TokenExpiredError" && refreshToken) {
        try {
          // Пытаемся обновить токены
          const newTokens = await this.authService.refreshToken(refreshToken);

          // Обновляем токены в запросе
          req.headers.authorization = `Bearer ${newTokens.accessToken}`;
          this.setNewTokens(res, newTokens);

          // Повторно декодируем новый access token
          const decoded = this.jwtService.verify(newTokens.accessToken);
          req["user"] = decoded;
          return next();
        } catch (refreshError) {
          this.handleRefreshError(refreshError);
        }
      }
      this.handleAccessError(accessError);
    }

    throw new UnauthorizedException("Требуется авторизация");
  }

  private extractAccessToken(req: Request): string | null {
    return req.headers.authorization?.split(" ")[1] || null;
  }

  private extractRefreshToken(req: Request): string | null {
    // Получаем refresh token из куков или тела запроса
    return req.cookies?.refreshToken || req.body?.refreshToken || null;
  }

  private setNewTokens(
    res: Response,
    tokens: { accessToken: string; refreshToken: string }
  ) {
    // Устанавливаем новые токены в заголовки и куки
    res.setHeader("New-Access-Token", tokens.accessToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 дней
    });
  }

  private isPublicRoute(req: Request): boolean {
    const publicRoutes = [
      "/api/auth/login",
      "/api/auth/registration",
      "/api/auth/refresh",
    ];
    return publicRoutes.includes(req.originalUrl);
  }

  private handleRefreshError(error: Error) {
    if (error.name === "TokenExpiredError") {
      throw new HttpException("Refresh token истек", HttpStatus.UNAUTHORIZED);
    }
    throw new HttpException(
      "Невалидный refresh token",
      HttpStatus.UNAUTHORIZED
    );
  }

  private handleAccessError(error: Error) {
    if (error.name === "TokenExpiredError") {
      throw new HttpException("Access token истек", HttpStatus.UNAUTHORIZED);
    }
    throw new HttpException("Невалидный access token", HttpStatus.UNAUTHORIZED);
  }
}
