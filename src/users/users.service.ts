import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserTokenDto } from "auth/dto/userToken.dto";
import * as bcrypt from "bcryptjs";

import { Repository } from "typeorm";

import { BanUserDto } from "users/dto/ban-user.dto";
import { CreateUserDto } from "users/dto/create-user.dto";
import { User } from "users/user.entity";
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) // Внедряем репозиторий User
    private userRepository: Repository<User>
  ) {}

  // Создание пользователя
  async createUser(dto: CreateUserDto): Promise<UserTokenDto | null> {
    if (dto.password !== "" && dto.password) {
      dto.password = await bcrypt.hash(dto.password, 5);
    }
    const user = await this.userRepository.create(dto); // Создаем пользователя
    user.role = "USER";
    await this.userRepository.save(user); // Сохраняем пользователя в базе данных

    // Назначаем роль "USER" по умолчанию

    return await this.getUserByEmail(user.email);
  }
  // Отдельная функция для создания суперпользователя
  async createSuperUser(dto: CreateUserDto) {
    const user = await this.userRepository.create(dto); // Создаем пользователя
    await this.userRepository.save(user); // Сохраняем пользователя в базе данных

    return user;
  }

  // Получение всех пользователей
  async getAllUsers() {
    const users = await this.userRepository.find();
    return users;
  }

  // Получение пользователя по email
  async getUserByEmail(email: string): Promise<UserTokenDto | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return user;
  }
  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return user;
  }
  async getUserByUsername(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async updateUser(id: number, dto: Partial<User>) {
    let user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (user) {
      if (dto.password !== "" && dto.password) {
        dto.password = await bcrypt.hash(dto.password, 5);
      } else {
        delete dto.password;
      }

      Object.assign(user, dto);
      return await this.userRepository.save(user);
    }
    throw new HttpException("Пользователь не найден", 404);
  }

  // Блокировка пользователя
  async banUser(dto: BanUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (user) {
      user.banned = true;
      user.banReason = dto.reason;
      await this.userRepository.save(user); // Сохраняем изменения
      return user;
    }

    throw new HttpException("Пользователь не найден", HttpStatus.NOT_FOUND);
  }

  async saveRefreshToken(userId: number, refreshToken: string | null) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        "Пользователь не найден, не удалось записать токен",
        HttpStatus.NOT_FOUND
      );
    }
    Object.assign(user, refreshToken);
    return await this.userRepository.save(user);
  }

  async deleteUser(id: number) {
    await this.userRepository.delete(id);
    return { message: "User deleted successfully." };
  }
}
