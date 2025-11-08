import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { Role } from "./role.entity";
import {
  AssignRoleDto,
  CreateRoleDto,
  RolesService,
  UpdateRoleDto,
} from "./roles.service";

@ApiTags("Роли")
@Controller("roles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: "Создать новую роль" })
  @ApiResponse({ status: 201, type: Role, description: "Роль успешно создана" })
  @ApiResponse({
    status: 400,
    description: "Роль с таким именем уже существует",
  })
  @Roles("ADMIN")
  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @ApiOperation({ summary: "Получить все роли" })
  @ApiResponse({ status: 200, type: [Role], description: "Список всех ролей" })
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @ApiOperation({ summary: "Получить роль по ID" })
  @ApiResponse({ status: 200, type: Role, description: "Роль найдена" })
  @ApiResponse({ status: 404, description: "Роль не найдена" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @ApiOperation({ summary: "Обновить роль" })
  @ApiResponse({
    status: 200,
    type: Role,
    description: "Роль успешно обновлена",
  })
  @ApiResponse({ status: 404, description: "Роль не найдена" })
  @Roles("ADMIN")
  @Put(":id")
  @UsePipes(ValidationPipe)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: "Удалить роль" })
  @ApiResponse({ status: 200, description: "Роль успешно удалена" })
  @ApiResponse({ status: 404, description: "Роль не найдена" })
  @Roles("ADMIN")
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  @ApiOperation({ summary: "Назначить роль пользователю" })
  @ApiResponse({ status: 200, description: "Роль успешно назначена" })
  @ApiResponse({ status: 404, description: "Пользователь или роль не найдены" })
  @ApiResponse({ status: 400, description: "У пользователя уже есть эта роль" })
  @Roles("ADMIN")
  @Post("assign")
  @UsePipes(ValidationPipe)
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.rolesService.assignRole(
      assignRoleDto.userId,
      assignRoleDto.roleId
    );
  }

  @ApiOperation({ summary: "Удалить роль у пользователя" })
  @ApiResponse({
    status: 200,
    description: "Роль успешно удалена у пользователя",
  })
  @ApiResponse({ status: 404, description: "Пользователь не найден" })
  @ApiResponse({ status: 400, description: "У пользователя нет этой роли" })
  @Roles("ADMIN")
  @Post("remove")
  @UsePipes(ValidationPipe)
  removeRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.rolesService.removeRole(
      assignRoleDto.userId,
      assignRoleDto.roleId
    );
  }
}
