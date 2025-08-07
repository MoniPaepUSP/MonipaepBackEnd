import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Patient } from "./Patient";
import { DiseaseOccurrence } from "./DiseaseOccurrence";
import { Symptom } from "./Symptom";

@Entity("symptom_occurrence")
export class SymptomOccurrence {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "boolean" })
  chat: boolean;

  @ManyToMany(() => Symptom, (symptom) => symptom.symptomOccurrences, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "symptom_occurrence_symptoms",
    joinColumn: { name: "symptom_occurrence_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "symptom_id", referencedColumnName: "id" }
  })
  symptoms: Symptom[];

  @Column({ type: "text", nullable: true })
  instructions: string | null;

  @Column({ type: "boolean", name: "is_patient_in_risk_group" })
  isPatientInRiskGroup: boolean;
  
  @Column({ type: "varchar", nullable: true, name: "refer_usm" })
  referUSM?: null | "UPA" | "UBS"

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

  @Column({ type: "jsonb", name: "probable_diseases" })
  probableDiseases: {
    id: string;
    name: string;
    isPatientInRiskGroup: boolean;
    suspictionScore: number;
  }[];
}
