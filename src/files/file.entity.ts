import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column()
  fileType: string;

  @Column()
  fileShortType: string;
}
