import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("comorbidity")
class Comorbidity {
  @PrimaryColumn()
  name: string

  @Column()
  description: string
}

export { Comorbidity }