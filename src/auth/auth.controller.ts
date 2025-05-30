import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ApiTags } from "@nestjs/swagger";

import { Request, Response } from "express";
import { AuthService } from "src/auth/auth.service";
import { LoginDto } from "src/auth/dto/login.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Roles } from "src/auth/roles-auth.decorator";
import { CreateUserDto } from "src/users/dto/create-user.dto";

@ApiTags("Авторизация")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post("/login")
  async login(
    @Body() userDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.login(userDto);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 дней
    });

    return { accessToken }; // Отдаем только access-токен, refresh хранится в cookie
  }
  @Roles("ADMIN", "TEACHER")
  @Post("/registration")
  registration(@Body() userDto: CreateUserDto) {
    return this.authService.registration(userDto);
  }

  @Post("/refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException("Нет refresh-токена");

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 дней
    });

    return { accessToken };
  }
  @UseGuards(JwtAuthGuard)
  @Post("/logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException("Нет refresh-токена");
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      await this.authService.logout(payload.id);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return { message: "Выход выполнен" };
    } catch (err) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
