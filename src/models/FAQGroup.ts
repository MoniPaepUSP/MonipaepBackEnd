import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("faq_group")
export class FAQGroup {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;
}
