import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity ('symptom')
class Symptom {
  @PrimaryColumn ()
  symptom: string

  @Column ()
  description: string
}

export { Symptom }