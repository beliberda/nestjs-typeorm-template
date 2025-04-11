import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
  // Документация для swagger
  @ApiProperty({
    example: "exsample@gmail.com",
    description: "Уникальный email",
  })
  @IsString({ message: "Должно быть строкой" })
  @IsEmail({}, { message: "Введите email" })
  readonly email: string;

  @ApiProperty({
    example: "qwerty",
    description: "строковый пароль, любые символы",
  })
  @IsString({ message: "Должно быть строкой" })
  @Length(4, 16, { message: "Не меньше 4 и не больше 16 символов" })
  password: string;

  @IsString({ message: "Должно быть строкой" })
  readonly firstName: string;
  @IsString({ message: "Должно быть строкой" })
  readonly lastName: string;
  @IsString({ message: "Должно быть строкой" })
  readonly phoneNumber: string;
}
