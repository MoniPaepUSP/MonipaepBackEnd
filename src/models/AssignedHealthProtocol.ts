import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";
import { Disease } from "./Disease"; // assuming Disease entity is defined in Disease.ts
import { HealthProtocol } from "./HealthProtocol"; // assuming HealthProtocol entity is defined in HealthProtocol.ts

@Entity("assigned_healthprotocol")
export class AssignedHealthProtocol {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", name: "disease_name" })
  diseaseName: string;

  @Column({ type: "uuid", name: "healthprotocol_id" })
  healthProtocolId: string;

  @ManyToOne(() => Disease, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "disease_name" })
  disease: Disease;

  @ManyToOne(() => HealthProtocol, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "healthprotocol_id" })
  healthProtocol: HealthProtocol;
}
