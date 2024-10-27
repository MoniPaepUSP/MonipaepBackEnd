import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Patient } from "./Patient"
import { USM } from "./USM"

@Entity("vaccines")
export class Vaccine{
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "timestamp" })
  date: Date

  @Column({ type: "varchar" })
  type: string

  @Column({ type: "uuid", name: "patient_id" })
  patientId: string

  @Column({ type: "varchar", name: "usm_name" })
  usmName: string

  @ManyToOne(() => Patient, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "patient_id" })
  patient: Patient

  @ManyToOne(() => USM, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "usm_name" })
  usm: USM
}