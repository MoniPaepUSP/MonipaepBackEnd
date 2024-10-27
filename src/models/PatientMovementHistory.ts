import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { DiseaseOccurrence } from "./DiseaseOccurrence"; // assuming DiseaseOccurrence entity is defined in DiseaseOccurrence.ts

@Entity("patient_movement_history")
export class PatientMovementHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "disease_occurrence_id" })
  diseaseOccurrenceId: string;

  @Column({ type: "varchar" })
  description: string;

  @Column({ type: "date" })
  date: Date;

  @ManyToOne(() => DiseaseOccurrence, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "disease_occurrence_id" })
  diseaseOccurrence: DiseaseOccurrence;
}
