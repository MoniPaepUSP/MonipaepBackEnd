import { Column, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "./Patient";
import { Disease } from "./Disease";

@Entity("special_condition")
class SpecialCondition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: "varchar" })
  name: string

  @Column({ type: "varchar" })
  description: string

  @ManyToMany(() => Disease, (disease) => disease.specialConditions, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  diseases: Disease[];

  @ManyToMany(() => Patient, (patient) => patient.specialConditions, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  patients: Patient[];
}

export { SpecialCondition }