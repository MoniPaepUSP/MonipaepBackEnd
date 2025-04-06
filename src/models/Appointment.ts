import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Patient } from "./Patient"; // assuming Patient entity is defined in Patient.ts
import { USM } from "./USM";

@Entity("appointment")
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamp" })
  date: Date;

  @Column({ type: "timestamp", name: "when_remember" })
  whenRemember: Date;

  @Column({ type: "varchar" })
  type: string;

  @Column({ type: "uuid", name: "usm_id" })
  usmId: string;

  @ManyToOne(() => USM, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "usm_id" })
  usm: USM;

  @Column({ type: "uuid", name: "patient_id" })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "patient_id" })
  patient: Patient;
}
