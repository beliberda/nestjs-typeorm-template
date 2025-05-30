import { UserRole } from "src/enums/userRoles";
import { UserStatus } from "src/enums/userStatus";

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" }) // Указываем название таблицы
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.DISTRIBUTOR })
  role: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ default: false })
  banned: boolean;

  @Column({ nullable: true })
  banReason: string;

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
