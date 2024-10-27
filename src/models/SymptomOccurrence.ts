import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Patient } from "./Patient"; // assuming Patient entity is defined in Patient.ts
import { Symptom } from "./Symptom"; // assuming Symptom entity is defined in Symptom.ts
import { DiseaseOccurrence } from "./DiseaseOccurrence"; // assuming DiseaseOccurrence entity is defined in DiseaseOccurrence.ts

@Entity("symptom_occurrence")
export class SymptomOccurrence {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "patient_id" })
  patientId: string;

  @Column({ type: "varchar", name: "symptom_name" })
  symptomName: string;

  @Column({ type: "uuid", name: "disease_occurrence_id", nullable: true })
  diseaseOccurrenceId: string | null;

  @Column({ type: "timestamp", name: "registered_date" })
  registeredDate: Date;

  @ManyToOne(() => Patient, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "patient_id" })
  patient: Patient;

  @ManyToOne(() => Symptom, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "symptom_name" })
  symptom: Symptom;

  @ManyToOne(() => DiseaseOccurrence, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "disease_occurrence_id" })
  diseaseOccurrence: DiseaseOccurrence | null;
}
