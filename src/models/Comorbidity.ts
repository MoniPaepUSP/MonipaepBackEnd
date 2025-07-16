import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "./Patient";
import { Disease } from "./Disease";

@Entity("comorbidity")
class Comorbidity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: "varchar" })
  name: string

  @Column({ type: "varchar" })
  description: string

  // Each disease will have some comorbidities or not
  @ManyToMany(() => Disease, (disease) => disease.comorbidities, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  diseases: Disease[];

  // Each patient will have some comorbidities or not
  @ManyToMany(() => Patient, (patient) => patient.comorbidities, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  patients: Patient[];
}

export { Comorbidity }