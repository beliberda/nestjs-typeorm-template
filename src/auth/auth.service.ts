import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "auth/dto/login.dto";

import * as bcrypt from "bcryptjs";
import { CreateUserDto } from "users/dto/create-user.dto";
import { User } from "users/user.entity";
import { UsersService } from "users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}
  async login(userDto: LoginDto) {
    const user = await this.validateUser(userDto);
    return this.generateTokens(user);
  }

  async registration(userDto: CreateUserDto) {
    const candidate = await this.userService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException(
        "Такой пользователь уже существует",
        HttpStatus.BAD_REQUEST
      );
    }

    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const user = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
    });
    // TODO ДОБАВИТЬ ЛОГИКУ ДОБАВЛЕНИЯ РОЛИ ПОСЛЕ СОЗДАНИЯ ЮЗЕРА
    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      const userData = this.jwtService.verify(refreshToken); // Проверяем refresh-токен
      const user = await this.userService.getUserById(userData.id);

      if (!user) {
        throw new UnauthorizedException("Пользователь не найден");
      }
      return this.generateTokens(user); // Генерируем новые токены
    } catch (error) {
      throw new UnauthorizedException("Ошибка валидации refresh-токена");
    }
  }
  private async generateTokens(user: User) {
    if (user.banned) {
      throw new UnauthorizedException("Пользователь забанен");
    }

    // ! Записать в токен необходимые данные
    const payload = {
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: "30m" }); // Access-токен на 15 минут
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "14d" }); // Refresh-токен на 14 дней

    return { accessToken, refreshToken };
  }

  // Валидация пользователя
  private async validateUser(userDto: LoginDto) {
    const user = await this.userService.getUserByUsername(userDto.username);
    if (!user) throw new UnauthorizedException("Некорректный email или пароль");

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password
    );
    if (!passwordEquals)
      throw new UnauthorizedException("Некорректный email или пароль");

    return user;
  }
  async saveRefreshToken(userId: number, refreshToken: string) {
    await this.userService.saveRefreshToken(userId, refreshToken);
  }

  async logout(userId: number) {
    await this.userService.saveRefreshToken(userId, null); // Удаляем refreshToken из базы
  }
}
