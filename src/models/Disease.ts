import { Column, Entity, PrimaryColumn } from "typeorm";

 @Entity("disease")
 class Disease {
  @PrimaryColumn()
  name: string;

  @Column()
  infected_Monitoring_Days: number;

  @Column()
  suspect_Monitoring_Days: number;
 }

 export { Disease }