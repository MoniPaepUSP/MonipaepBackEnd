import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("faq_suggestion")
export class FAQSuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: "varchar", unique: true })
  question: string;
}