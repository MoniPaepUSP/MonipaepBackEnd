import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { FAQ } from "./FAQ";

@Entity("faq_group")
export class FAQGroup {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @OneToMany(() => FAQ, faq => faq.faqGroup)
  faqs: FAQ[];
}
