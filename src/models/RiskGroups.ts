import { Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Comorbidity } from "./Comorbidity";
import { SpecialCondition } from "./SpecialCondition";

@Entity("risk_groups")
class RiskGroups {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Each risk group will contain some or none comorbitites
  @ManyToMany(() => Comorbidity, (comorbidity) => comorbidity.riskGroups, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "risk_group_comorbidities",
    joinColumn: { name: "risk_group_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "comorbidity_id", referencedColumnName: "id" }
  })
  comorbidities: Comorbidity[];

  // Each risk group will contain some or none special conditions
  @ManyToMany(() => SpecialCondition, (specialCondition) => specialCondition.riskGroups, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "risk_group_special_conditions",
    joinColumn: { name: "risk_group_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "special_condition_id", referencedColumnName: "id" }
  })
  specialConditions: SpecialCondition[];
}

export { RiskGroups }