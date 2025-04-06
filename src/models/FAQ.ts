import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { FAQGroup } from "./FAQGroup";

@Entity("faq")
export class FAQ {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  question: string;

  @Column({ type: "varchar" })
  answer: string;

  @Column({ type: "uuid", name: "faq_group_id" })
  faqGroupId: string;

  @ManyToOne(() => FAQGroup, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "faq_group_id" })
  faqGroup: FAQGroup;
}
