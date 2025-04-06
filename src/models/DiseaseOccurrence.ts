import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
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
  dateEnd: Date | null;
  
  @Column({ type: "varchar" })
  status: string;

  @Column({ type: "uuid", name: "patient_id" })
  patientId: string;
  
  // Each disease occurrence will be related to one patient
  @ManyToOne(() => Patient, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "patient_id" })
  patient: Patient;

  @Column({ type: "uuid", name: "disease_id" })
  diseaseId: string;

  // There will be a lot of occurrences of the same disease
  @ManyToOne(() => Disease, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "disease_id" })
  disease: Disease;
}
