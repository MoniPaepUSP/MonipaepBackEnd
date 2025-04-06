import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, ManyToMany, JoinTable } from "typeorm";
import * as bcrypt from "bcrypt";
import { Comorbidity } from "./Comorbidity";
import { SpecialCondition } from "./SpecialCondition";

@Entity("patient")
export class Patient {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  password: string;

  @Column({ type: "varchar", unique: true, nullable: false, name: "cpf" })
  cpf: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar", nullable: false })
  gender: string;

  @Column({ type: "varchar" })
  phone: string;

  @Column({ type: "varchar", nullable: true, name: "last_gps_location" })
  lastGPSLocation: string | null;

  @Column({ type: "boolean", name: "allow_sms" })
  allowSms: boolean;

  @Column({ type: "varchar", nullable: true, name: "work_address" })
  workAddress: string | null;

  @Column({ type: "varchar", name: "home_address" })
  homeAddress: string;

  @Column({ type: "varchar" })
  neighborhood: string;

  @Column({ type: "integer", name: "house_number" })
  houseNumber: number;

  @Column({ type: "boolean", name: "has_health_plan" })
  hasHealthPlan: boolean;

  @Column({ type: "date" })
  birthdate: Date;

  @Column({ type: "varchar", nullable: false })
  status: "Óbito" | "Infectado" | "Suspeito" | "Saudável";

  @Column({ type: "boolean", default: true, name: "active_account" })
  activeAccount: boolean;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date;

  @ManyToMany(() => Comorbidity, (comorbidity) => comorbidity.patients, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "patient_comorbidities",
    joinColumn: { name: "patient_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "comorbidity_id", referencedColumnName: "id" }
  })
  comorbidities: Comorbidity[];

  @ManyToMany(() => SpecialCondition, (specialCondition) => specialCondition.patients, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: "patient_special_conditions",
    joinColumn: { name: "patient_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "special_condition_id", referencedColumnName: "id" }
  })
  specialConditions: SpecialCondition[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
