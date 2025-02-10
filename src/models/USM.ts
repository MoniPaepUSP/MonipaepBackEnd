import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity ('usm')
export class USM {
  @PrimaryColumn ({ type: 'varchar' })
  name: string;

  @Column ({ type: 'varchar' })
  address: string;

  @Column ({ type: 'varchar' })
  neighborhood: string;

  @Column ({ type: 'double precision' })
  latitude: number;

  @Column ({ type: 'double precision' })
  longitude: number;
}
