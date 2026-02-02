import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AgentEntity } from '../agent/agent.entity';
import { Type } from 'class-transformer';

@Entity()
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Type(() => Number) 
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 20, default: 'kg' })
  unit: string;  // NEW: e.g., 'kg', 'piece', 'dozen', 'liter'

  @Type(() => Number) 
  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'int' })
  agentId: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;  // 0.0 to 5.0

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  // NEW: Marketing
  @Type(() => Number) 
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount: number;  

  // NEW: Agricultural specific
  @Column({ type: 'boolean', default: false })
  isOrganic: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location: string;  // Farm/seller location

  @Column({ type: 'timestamp', nullable: true })
  harvestDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  // NEW: Additional details
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];  // e.g., ['fresh', 'local', 'seasonal']

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  minOrderQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxOrderQuantity: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  // Timestamps (auto-managed)
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => AgentEntity, (agent) => agent.products, { onDelete: 'CASCADE' })
  @Type(() => Number) 
  @JoinColumn({ name: 'agentId' })
  agent: AgentEntity;
}
