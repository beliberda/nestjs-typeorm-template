import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "auth/auth.service";
import { LoginDto } from "auth/dto/login.dto";
import { Roles } from "auth/roles-auth.decorator";
import { Request, Response } from "express";
import { CreateUserDto } from "users/dto/create-user.dto";

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
      secure: true,
      sameSite: "strict",
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 дней
    });

    return { accessToken }; // Отдаем только access-токен, refresh хранится в cookie
  }
  @Roles("ADMIN", "MODERATOR")
  @Post("/registration")
  registration(@Body() userDto: CreateUserDto) {
    return this.authService.registration(userDto);
  }

  @Post("/refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException("Нет refresh-токена");

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 дней
    });

    return { accessToken };
  }
  @Post("/logout")
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException("Нет refresh-токена");
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      await this.authService.logout(payload.id);
    } catch (err) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Выход выполнен" });
  }
}
