import { ApiProperty } from "@nestjs/swagger";

export class UserTokenDto {
  @ApiProperty({ example: "user@example.com" })
  readonly email: string;

  @ApiProperty({ example: 1 })
  readonly id: number;

  @ApiProperty({ example: ["admin", "user"], type: [String] })
  readonly roles: string[];

  readonly password?: string;
}
