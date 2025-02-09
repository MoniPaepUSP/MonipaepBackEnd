import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid'

@Entity ('health_protocols')
class HealthProtocol {
  @PrimaryGeneratedColumn ('uuid')
  id: string;
  
  @Column ({ type: 'varchar', nullable: false })
  title: string;

  @Column ({ type: 'varchar', nullable: false })
  description: string;
}

export { HealthProtocol };
