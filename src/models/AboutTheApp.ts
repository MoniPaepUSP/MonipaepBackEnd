import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Patient } from './Patient'

@Entity ('about')
class AboutTheApp {
  @PrimaryGeneratedColumn ('uuid')
  id:string

  @Column ({ type:'varchar', nullable: false })
  main: string

  @Column ({ type:'varchar', nullable: false })
  secondary: string
}

export { AboutTheApp }