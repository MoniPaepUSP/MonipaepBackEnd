import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { SystemUser } from "./SystemUser"; // assuming SystemUser entity is defined in SystemUser.ts

@Entity("permissions")
export class Permissions {
  @PrimaryColumn({ type: "uuid", name: "user_id" })
  userId: string;

  @Column({ type: "boolean", default: false })
  authorized: boolean;

  @Column({ type: "boolean", default: false, name: "local_adm" })
  localAdm: boolean;

  @Column({ type: "boolean", default: false, name: "general_adm" })
  generalAdm: boolean;

  @OneToOne(() => SystemUser, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: SystemUser;
}