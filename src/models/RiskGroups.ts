import { Column, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Comorbidity } from "./Comorbidity";
import { SpecialCondition } from "./SpecialCondition";
import { Disease } from "./Disease";

@Entity("risk_groups")
class RiskGroups {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Disease, (disease) => disease.riskGroups)
  disease: Disease;

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