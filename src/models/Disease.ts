import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { HealthProtocol } from "./HealthProtocol";
import { Symptom } from "./Symptom";
import { RiskGroups } from "./RiskGroups";
import { DiseaseKeySymptom } from "./DiseaseKeySymptom";

@Entity("disease")
export class Disease {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "integer", name: "infected_monitoring_days" })
  infectedMonitoringDays: number;

  @Column({ type: "integer", name: "suspected_monitoring_days" })
  suspectedMonitoringDays: number;

  @OneToOne(() => RiskGroups, (riskGroup) => riskGroup.disease, { cascade: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "risk_groups_id" }) // Disease owns the relation
  riskGroups: RiskGroups;

  @ManyToMany(() => Symptom, (symptom) => symptom.diseases, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "disease_symptoms",
    joinColumn: { name: "disease_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "symptom_id", referencedColumnName: "id" }
  })
  symptoms: Symptom[];

  @ManyToMany(() => Symptom, (symptom) => symptom.diseases, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "disease_alarm_signs",
    joinColumn: { name: "disease_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "symptom_id", referencedColumnName: "id" }
  })
  alarmSigns: Symptom[];

  @ManyToMany(() => Symptom, (symptom) => symptom.diseases, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "disease_shock_signs",
    joinColumn: { name: "disease_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "symptom_id", referencedColumnName: "id" }
  })
  shockSigns: Symptom[];

  @OneToMany(() => DiseaseKeySymptom, (diseaseKeySymptom) => diseaseKeySymptom.disease, {
    cascade: true,
    eager: true,
  })
  diseaseKeySymptoms: DiseaseKeySymptom[];

  @OneToMany(() => HealthProtocol, (protocol) => protocol.disease, {
    cascade: true, onDelete: "CASCADE", onUpdate: "CASCADE"
  })
  healthProtocols: HealthProtocol[];
}