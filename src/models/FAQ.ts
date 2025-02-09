import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity ('faq')
export class FAQ {
  @PrimaryGeneratedColumn ('uuid')
  id: string;

  @Column ({ type: 'varchar', unique: true })
  question: string;

  @Column ({ type: 'varchar' })
  answer: string;
}
