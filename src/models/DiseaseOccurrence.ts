import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Patient } from "./Patient"; // assuming Patient entity is defined in Patient.ts
import { Disease } from "./Disease"; // assuming Disease entity is defined in Disease.ts

@Entity("disease_occurrence")
export class DiseaseOccurrence {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: true })
  diagnosis: string | null;

  @Column({ type: "timestamp", name: "date_start", nullable: true })
  dateStart: Date | null;

  @Column({ type: "timestamp", name: "date_end", nullable: true })
  dateEnd?: Date | null;

  @Column({ type: "varchar" })
  status: "Óbito" | "Infectado" | "Suspeito" | "Saudável";

  @Column({ type: "uuid", name: "patient_id" })
  patientId: string;

  // Each disease occurrence will be related to one patient
  @ManyToOne(() => Patient, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "patient_id" })
  patient: Patient;

  // Each disease occurrence can be related to multiple diseases
  @ManyToMany(() => Disease, (disease) => disease.diseaseOccurrences, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "disease_occurrence_diseases",
    joinColumn: { name: "disease_occurrence_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "disease_id", referencedColumnName: "id" }
  })
  diseases: Disease[];
}
