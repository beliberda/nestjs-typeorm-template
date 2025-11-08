import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import * as bcrypt from "bcryptjs";
import { LoginDto } from "src/auth/dto/login.dto";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { User } from "src/users/user.entity";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(userDto: LoginDto) {
    const user = await this.validateUser(userDto);
    const tokens = await this.generateTokens(user);
    await this.userService.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async registration(userDto: CreateUserDto) {
    const candidate = await this.userService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException(
        "Пользователь с таким username существует",
        HttpStatus.BAD_REQUEST
      );
    }
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const user = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
    });
    return user;
  }

  async logout(userId: number) {
    await this.userService.saveRefreshToken(userId, null);
    return true;
  }

  private async generateTokens(user: User) {
    const roles = user.roles ? user.roles.map((role) => role.name) : [];
    const payload = {
      id: user.id,
      roles: roles,
      email: user.email,
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "1h",
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: "14d",
      }),
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token provided");
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userService.getUserById(payload.id);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      if (user.banned) {
        throw new UnauthorizedException("User is banned");
      }

      const tokens = await this.generateTokens(user);
      await this.userService.saveRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async validateUser(userDto: LoginDto) {
    const user = await this.userService.getUserByUsername(userDto.username);
    if (!user) {
      throw new UnauthorizedException({
        message: "Некорректный username или пароль",
      });
    }
    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password
    );
    if (!passwordEquals) {
      throw new UnauthorizedException({
        message: "Некорректный username или пароль",
      });
    }
    return user;
  }
}
