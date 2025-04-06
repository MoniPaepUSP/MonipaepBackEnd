import { Column, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "./Patient";
import { RiskGroups } from "./RiskGroups";

@Entity("special_condition")
class SpecialCondition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: "varchar" })
  name: string

  @Column({ type: "varchar" })
  description: string

  @ManyToMany(() => RiskGroups, (riskGroups) => riskGroups.specialConditions, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  riskGroups: RiskGroups[];

  @ManyToMany(() => Patient, (patient) => patient.specialConditions, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  patients: Patient[];
}

export { SpecialCondition }