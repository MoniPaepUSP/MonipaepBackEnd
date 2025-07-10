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

  @Column({ type: "uuid", name: "disease_id" })
  diseaseId: string;

  @ManyToOne(() => Disease, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "disease_id" })
  disease: Disease;
}

export { HealthProtocol };
