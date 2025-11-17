import { ProductEntity } from 'src/product/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Entity()
export class AgentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'varchar', length: 100})
  fullName: string;

  @Column({ type: 'int' })
  age: number;

  @Column({type: 'varchar', length: 200})
  address: string;

  @Column({type: 'varchar', length: 100})
  email: string;

  @Column({type: 'varchar', length: 15})
  phone: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  bio: string;

  @Column()
  nidNumber: string;

  @Column({ nullable: true })
  nidImage: string;

  @Column({type:'enum', enum: AgentStatus, default: AgentStatus.ACTIVE})
  status:AgentStatus;

  @OneToMany(() => ProductEntity, (product) => product.agent)
  products: ProductEntity[];
}