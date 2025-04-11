import { config } from "dotenv";
config(); // Загружает .env перед созданием контекста NestJS
import * as bcrypt from "bcrypt";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { UsersService } from "src/users/users.service";
import { RolesService } from "src/roles/roles.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AddRoleDto } from "src/users/dto/add-role.dto";

async function createSuperUser() {
  const app = await NestFactory.create(AppModule);
  const usersService = app.get(UsersService);
  const rolesService = app.get(RolesService);
  const hashedPassword = await bcrypt.hash("supersecurepassword", 5);
  const superUser: CreateUserDto = {
    email: "superadmin@example.com",
    password: hashedPassword,
    firstName: "Admin",
    lastName: "Admin",
    phoneNumber: "88005553535",
  };

  const existingUser = await usersService.getUserByEmail(superUser.email);
  if (existingUser) {
    console.log("Суперпользователь уже существует.");
    await app.close();
    return;
  }

  const user = await usersService.createSuperUser(superUser);

  if (!user) {
    console.log("Ошибка при создании суперпользователя.");
    await app.close();
    return;
  }
  const adminRole = await rolesService.getRoleByValue("ADMIN");
  if (adminRole) {
    const addRoleDto: AddRoleDto = { userId: user.id, value: "ADMIN" };
    await usersService.addRole(addRoleDto);
  } else {
    console.log("Роль ADMIN не найдена.");
    console.log("Суперпользователь создан, но без роли");
  }

  console.log("Суперпользователь создан");
  await app.close();
}

createSuperUser().catch((error) => {
  console.error("Ошибка при создании суперпользователя:", error);
});
