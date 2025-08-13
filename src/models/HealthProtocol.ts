import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Disease } from "./Disease";
import { Symptom } from "./Symptom";

@Entity("health_protocol")
class HealthProtocol {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "disease_id" })
  diseaseId: string;

  @ManyToOne(() => Disease, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "disease_id" })
  disease: Disease;

  @Column({ type: "int", name: "gravity_level" })
  gravityLevel: number;

  @Column({ type: "text", name: "gravity_label" })
  gravityLabel: string;

  @Column({ type: "text" })
  instructions: string;

  @Column({ type: "varchar", nullable: true, name: "refer_usm" })
  referUSM?: "UPA" | "UBS"

  @ManyToMany(() => Symptom, (symptom) => symptom.healthProtocols, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "health_protocols_symptoms",
    joinColumn: { name: "health_protocol_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "symptom_id", referencedColumnName: "id" }
  })
  symptoms: Symptom[];
}

export { HealthProtocol };
