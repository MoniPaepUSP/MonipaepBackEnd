import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Disease } from "./Disease";

@Entity("health_protocol")
class HealthProtocol {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  severity: "leve" | "moderado" | "grave" | "muito grave";

  @Column({ type: "text" })
  instructions: string;

  @ManyToOne(() => Disease, (disease) => disease.healthProtocols)
  disease: Disease;
}

export { HealthProtocol };
