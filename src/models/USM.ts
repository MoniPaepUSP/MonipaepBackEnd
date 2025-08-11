import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("usm")
export class USM {
  @PrimaryColumn("varchar") // Get from Google Places ID
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  state: string;

  @Column({ type: "varchar" })
  city: string;

  @Column({ type: "varchar" })
  neighborhood: string;

  @Column({ type: "varchar", nullable: true })
  street: string | null;

  @Column({ type: "varchar", nullable: true })
  number: string | null;

  @Column("text", { array: true, name: "weekday_descriptions", nullable: true })
  weekdayDescriptions?: string[] | null;

  @Column({ type: "varchar", nullable: true })
  type?: null | "UPA" | "UBS"

  @Column({ type: "double precision" })
  latitude: number;

  @Column({ type: "double precision" })
  longitude: number;
}
