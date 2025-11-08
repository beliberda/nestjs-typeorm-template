import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    example: "user@example.com",
    description: "Email или username пользователя",
  })
  readonly username: string;

  @ApiProperty({
    example: "password123",
    description: "Пароль пользователя",
    minLength: 4,
    maxLength: 16,
  })
  readonly password: string;
}
