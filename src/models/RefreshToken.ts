import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Patient } from "./Patient"; // assuming the patient entity is named Patient
import { SystemUser } from "./SystemUser"; // assuming the system user entity is named SystemUser

@Entity("refresh_token")
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "integer", name: "expires_in" })
  expiresIn: number;

  @Column({ type: "uuid", nullable: true, name: "patient_id" })
  patientId?: string;

  @Column({ type: "uuid", nullable: true, name: "system_user_id" })
  systemUserId?: string;

  @ManyToOne(() => Patient, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "patient_id" })
  patient?: Patient;

  @ManyToOne(() => SystemUser, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "system_user_id" })
  systemUser?: SystemUser;
}
