import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/user.entity";
import { Repository } from "typeorm";
import { Role } from "./role.entity";

export class CreateRoleDto {
  @ApiProperty({
    example: "admin",
    description: "Уникальное имя роли",
  })
  name: string;

  @ApiProperty({
    example: "Администратор системы",
    description: "Описание роли",
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: { canEdit: true, canDelete: true },
    description: "Права доступа в формате JSON",
    required: false,
  })
  permissions?: Record<string, any>;
}

export class UpdateRoleDto {
  @ApiProperty({
    example: "admin",
    description: "Уникальное имя роли",
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: "Администратор системы",
    description: "Описание роли",
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: { canEdit: true, canDelete: true },
    description: "Права доступа в формате JSON",
    required: false,
  })
  permissions?: Record<string, any>;
}

export class AssignRoleDto {
  @ApiProperty({
    example: 1,
    description: "ID пользователя",
  })
  userId: number;

  @ApiProperty({
    example: 1,
    description: "ID роли",
  })
  roleId: number;
}

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new HttpException(
        "Роль с таким именем уже существует",
        HttpStatus.BAD_REQUEST
      );
    }

    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ["users"],
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ["users"],
    });

    if (!role) {
      throw new NotFoundException(`Роль с ID ${id} не найдена`);
    }

    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { name },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.findByName(updateRoleDto.name);
      if (existingRole) {
        throw new HttpException(
          "Роль с таким именем уже существует",
          HttpStatus.BAD_REQUEST
        );
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }

  async assignRole(userId: number, roleId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["roles"],
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
    }

    const role = await this.findOne(roleId);

    // Проверяем, есть ли уже такая роль у пользователя
    if (user.roles && user.roles.some((r) => r.id === roleId)) {
      throw new HttpException(
        "У пользователя уже есть эта роль",
        HttpStatus.BAD_REQUEST
      );
    }

    if (!user.roles) {
      user.roles = [];
    }

    user.roles.push(role);
    return await this.userRepository.save(user);
  }

  async removeRole(userId: number, roleId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["roles"],
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
    }

    if (!user.roles || user.roles.length === 0) {
      throw new HttpException(
        "У пользователя нет ролей",
        HttpStatus.BAD_REQUEST
      );
    }

    user.roles = user.roles.filter((r) => r.id !== roleId);
    return await this.userRepository.save(user);
  }
}
