import { NestFactory } from "@nestjs/core";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import { AppModule } from "src/app.module";
import { UsersService } from "src/users/users.service";
config(); // Загружает .env перед созданием контекста NestJS

import { CreateUserDto } from "src/users/dto/create-user.dto";

async function createSuperUser() {
  const app = await NestFactory.create(AppModule);
  const usersService = app.get(UsersService);
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

  console.log("Суперпользователь создан");
  await app.close();
}

createSuperUser().catch((error) => {
  console.error("Ошибка при создании суперпользователя:", error);
});
