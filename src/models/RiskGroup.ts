import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("risk_group")
class RiskGroup {
  @PrimaryColumn()
  name: string

  @Column()
  description: string
}

export { RiskGroup }