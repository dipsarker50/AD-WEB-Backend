import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AgentEntity } from "./agent.entity";

@Entity()
export class AgentImageEntity {
        @PrimaryGeneratedColumn()
        id: number;
        
        @Column({ nullable: true })
        nidImagePath: string;

        @OneToOne(() => AgentEntity, agent => agent.agentImage)
        agent: AgentEntity;



}