import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity ('patients')
export class Patient {
  @PrimaryGeneratedColumn ('uuid')
  id: string;

  @Column ({ type: 'varchar', nullable: false })
  name: string;

  @Column ({ type: 'varchar', nullable: false })
  password: string;

  @Column ({ type: 'varchar', unique: true, nullable: false, name: 'cpf' })
  CPF: string;

  @Column ({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column ({ type: 'varchar', nullable: false })
  gender: string;

  @Column ({ type: 'varchar' })
  phone: string;

  @Column ({ type: 'varchar', nullable: true, name: 'last_gps_location' })
  lastGPSLocation: string | null;

  @Column ({ type: 'boolean', name: 'allow_sms' })
  allowSMS: boolean;

  @Column ({ type: 'varchar', nullable: true, name: 'work_address' })
  workAddress: string | null;

  @Column ({ type: 'varchar', name: 'home_address' })
  homeAddress: string;

  @Column ({ type: 'varchar' })
  neighborhood: string;

  @Column ({ type: 'integer', name: 'house_number' })
  houseNumber: number;

  @Column ({ type: 'boolean', name: 'has_health_plan' })
  hasHealthPlan: boolean;

  @Column ({ type: 'date' })
  birthdate: Date;

  @Column ({ type: 'varchar', nullable: false })
  status: string;

  @Column ({ type: 'boolean', default: true, name: 'active_account' })
  activeAccount: boolean;

  @CreateDateColumn ({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn ({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert ()
  @BeforeUpdate ()
  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash (this.password, 10);
  }
}
