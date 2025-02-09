import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity ('disease')
export class Disease {
  @PrimaryColumn ({ type: 'varchar' })
  name: string;

  @Column ({ type: 'integer', name: 'infected_monitoring_days' })
  infectedMonitoringDays: number;

  @Column ({ type: 'integer', name: 'suspected_monitoring_days' })
  suspectedMonitoringDays: number;
}