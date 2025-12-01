import { ProductEntity } from 'src/product/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { AgentImageEntity } from './agentImage.entity';

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

  @Column({type: 'varchar', length: 100})
  password: string;

  @Column({type: 'varchar', length: 15})
  phone: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  bio: string;

  @Column()
  nidNumber: string;

  @Column({type:'enum', enum: AgentStatus, default: AgentStatus.ACTIVE})
  status:AgentStatus;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  verificationTokenExpiry: Date | null;


  @OneToMany(() => ProductEntity, (product) => product.agent)
  products: ProductEntity[];

  @OneToOne(() => AgentImageEntity, agentImage => agentImage.agent, { cascade: true })
  @JoinColumn()
  agentImage: AgentImageEntity;

}