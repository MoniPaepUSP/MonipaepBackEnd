import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
} from "typeorm";
import * as bcrypt from "bcrypt";

@Entity("system_user")
export class SystemUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", unique: true, name: "cpf" })
  CPF: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ type: "varchar" })
  department: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
