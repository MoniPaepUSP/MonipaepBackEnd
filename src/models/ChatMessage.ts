import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { SymptomOccurrence } from "./SymptomOccurrence";

@Entity("chat_message")
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Associate the message with a specific conversation or symptom occurrence
  @Column({ type: "uuid", name: "symptom_occurrence_id" })
  symptomOccurrenceId: string;

  // Role can be 'user' or 'assistant'
  @Column({ type: "varchar"})
  role: "user" | "assistant";

  // The message content
  @Column({ type: "text" })
  message: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // Many to One relation with the symptom Occurrence
  @ManyToOne(() => SymptomOccurrence, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "symptom_occurrence_id" })
  symptomOccurrence: SymptomOccurrence;
}
