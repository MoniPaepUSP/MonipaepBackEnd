import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("faq_suggestions")
export class FAQSuggestions{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: "varchar", unique: true })
  question: string;
}