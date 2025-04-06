import { Column, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "./Patient";
import { RiskGroups } from "./RiskGroups";

@Entity("comorbidity")
class Comorbidity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: "varchar" })
  name: string

  @Column({ type: "varchar" })
  description: string

  // Each risk groups will have some comorbidities or not
  @ManyToMany(() => RiskGroups, (riskGroups) => riskGroups.comorbidities, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  riskGroups: RiskGroups[];

  // Each patient will have some comorbidities or not
  @ManyToMany(() => Patient, (patient) => patient.comorbidities, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  patients: Patient[];
}

export { Comorbidity }