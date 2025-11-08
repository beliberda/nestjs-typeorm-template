import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Roles } from "src/auth/roles-auth.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { BanUserDto } from "src/users/dto/ban-user.dto";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { User } from "src/users/user.entity";
import { UsersService } from "src/users/users.service";

// В контроллере мы лишь прописываем пути запросов к api и методы, которые берут логику из нужных классов
@ApiTags("Пользователи") //заголовок блока контроллера
@ApiBearerAuth("JWT-auth")
@Controller("users")
export class UsersController {
  constructor(private userService: UsersService) {}

  // post запрос на создание пользователя, внутрь передаем данные пользователя по схеме userDto
  @ApiOperation({ summary: "Создание пользователя" }) //Документирование для swagger
  @ApiResponse({ status: 200, type: User })
  @UsePipes(ValidationPipe) //pipe для проверки через ValidationPipe
  @Roles("ADMIN")
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.userService.createUser(userDto);
  }

  @ApiOperation({ summary: "Получение всех пользователей" })
  @ApiResponse({ status: 200, type: [User] })
  @UseGuards(JwtAuthGuard) //проверка на авторизацию
  @Roles("ADMIN")
  @UseGuards(RolesGuard)
  @Get()
  getAll() {
    return this.userService.getAllUsers();
  }
  // @ApiOperation({ summary: "Выдача ролей" })
  // @ApiResponse({ status: 200 })
  // @UseGuards(JwtAuthGuard) //проверка на авторизацию
  // @Roles("ADMIN")
  // @UseGuards(RolesGuard)
  // @Post("/role")
  // addRole(@Body() dto: AddRoleDto) {
  //   return this.userService.addRole(dto);
  // }
  @ApiOperation({ summary: "Бан пользователя" })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard) //проверка на авторизацию
  @Roles("ADMIN") //роль тех, кто может банить
  @UseGuards(RolesGuard)
  @Post("/ban")
  banUser(@Body() dto: BanUserDto) {
    return this.userService.banUser(dto);
  }

  @ApiOperation({ summary: "Обновить данные пользователя" })
  @ApiResponse({
    status: 200,
    type: User,
    description: "Пользователь успешно обновлен",
  })
  @ApiResponse({ status: 404, description: "Пользователь не найден" })
  @Roles("ADMIN")
  @UseGuards(JwtAuthGuard)
  @Put(":id")
  updateUser(@Param("id") id: number, @Body() dto: Partial<User>) {
    return this.userService.updateUser(id, dto);
  }

  @ApiOperation({ summary: "Удалить пользователя" })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard) //проверка на авторизацию
  @Roles("ADMIN") //роль тех, кто может удалять
  @UseGuards(RolesGuard)
  @Delete(":id")
  deleteUser(@Param("id") id: number) {
    return this.userService.deleteUser(id);
  }
}
