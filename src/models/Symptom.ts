import { Column, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Disease } from "./Disease";
import { SymptomOccurrence } from "./SymptomOccurrence";

@Entity("symptom")
class Symptom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: "varchar" })
  name: string

  @Column({ type: "varchar" })
  description: string

  @ManyToMany(() => Disease, (disease) => disease.symptoms, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  diseases: Disease[];

  @ManyToMany(() => SymptomOccurrence, (symptomOccurrence) => symptomOccurrence.symptoms, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  symptomOccurrences: SymptomOccurrence[];
}

export { Symptom }