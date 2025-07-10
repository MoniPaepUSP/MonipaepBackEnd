import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Disease } from "./Disease";
import { Symptom } from "./Symptom";

@Entity("disease_key_symptom")
export class DiseaseKeySymptom {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "float" })
  weight: number;

  @Column({ type: "uuid", name: "disease_id" })
  diseaseId: string

  @Column({ type: "uuid", name: "symptom_id" })
  symptomId: string

  @ManyToOne(() => Disease, (disease) => disease.diseaseKeySymptoms, { onDelete: "CASCADE" })
  @JoinColumn({ name: "disease_id" })
  disease: Disease;

  @ManyToOne(() => Symptom, { onDelete: "CASCADE" })
  @JoinColumn({ name: "symptom_id" })
  symptom: Symptom;
}