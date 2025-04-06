import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity("about")
class AboutTheApp {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", nullable: false })
  main: string

  @Column({ type: "varchar", nullable: false })
  secondary: string
}

export { AboutTheApp }