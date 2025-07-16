import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { HealthProtocol } from "./HealthProtocol";
import { Symptom } from "./Symptom";
import { DiseaseKeySymptom } from "./DiseaseKeySymptom";
import { Comorbidity } from "./Comorbidity";
import { SpecialCondition } from "./SpecialCondition";

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

  // Each disease will contain some or none comorbitites as risk groups
  @ManyToMany(() => Comorbidity, (comorbidity) => comorbidity.diseases, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "disease_comorbidities",
    joinColumn: { name: "disease_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "comorbidity_id", referencedColumnName: "id" }
  })
  comorbidities: Comorbidity[];

  // Each disease will contain some or none special conditions as risk groups
  @ManyToMany(() => SpecialCondition, (specialCondition) => specialCondition.diseases, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "disease_special_conditions",
    joinColumn: { name: "disease_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "special_condition_id", referencedColumnName: "id" }
  })
  specialConditions: SpecialCondition[];

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