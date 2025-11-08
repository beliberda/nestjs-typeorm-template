import { ApiProperty } from "@nestjs/swagger";

export class BanUserDto {
  @ApiProperty({
    example: 1,
    description: "ID пользователя для блокировки",
  })
  readonly userId: number;

  @ApiProperty({
    example: "Нарушение правил сообщества",
    description: "Причина блокировки",
  })
  readonly reason: string;
}
