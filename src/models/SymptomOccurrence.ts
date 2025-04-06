import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Patient } from "./Patient";
import { DiseaseOccurrence } from "./DiseaseOccurrence";

@Entity("symptom_occurrence")
export class SymptomOccurrence {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text", name: "symptoms", nullable: true })
  symptoms: string | null;

  @Column({ type: "text", name: "remarks", nullable: true })
  remarks: string | null;

  @Column({ type: "timestamp", name: "registered_date" })
  registeredDate: Date;

  @Column({ type: "uuid", name: "patient_id" })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "patient_id" })
  patient: Patient;

  @Column({ type: "uuid", name: "disease_occurrence_id", nullable: true })
  diseaseOccurrenceId: string | null;

  @ManyToOne(() => DiseaseOccurrence, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "disease_occurrence_id" })
  diseaseOccurrence: DiseaseOccurrence | null;
}
