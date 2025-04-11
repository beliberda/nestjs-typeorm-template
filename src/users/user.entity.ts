import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" }) // Указываем название таблицы
export class User {
  @ApiProperty({ example: "1", description: "Уникальный идентификатор" })
  @PrimaryGeneratedColumn() // Автоинкрементный первичный ключ
  id: number;

  @ApiProperty({
    example: "exsample@gmail.com",
    description: "Уникальная почта пользователя",
  })
  @Column({ unique: true, nullable: false }) // Уникальное поле, не может быть null
  email: string;

  @ApiProperty({ example: "1234", description: "пароль пользователя" })
  @Column({ nullable: false }) // Не может быть null
  password: string;

  @ApiProperty({ example: "88005553535", description: "телефон пользователя" })
  @Column({ nullable: false }) // Не может быть null
  phoneNumber: string;

  @ApiProperty({
    example: "false",
    description: "Забанен или нет, по умолчанию false",
  })
  @Column({ default: false }) // Значение по умолчанию
  banned: boolean;

  @ApiProperty({ example: "бан за бан", description: "Описание причины бана" })
  @Column({ nullable: true }) // Может быть null
  banReason: string;

  @ApiProperty({ example: "Иван", description: "Имя пользователя" })
  @Column({ nullable: false }) // Не может быть null
  firstName: string;

  @ApiProperty({ example: "Иванов", description: "Фамилия пользователя" })
  @Column({ nullable: false }) // Не может быть null
  lastName: string;
  @ApiProperty({ example: "ADMIN", description: "Роль пользователя" })
  @Column({ nullable: false }) // Не может быть null
  role: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    nullable: false,
  })
  refreshToken: string;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
