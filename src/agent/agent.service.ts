import { Injectable, Res} from '@nestjs/common';
import { CreateAgentDto,PatchAgentDto } from './agent.dto';
import { AgentEntity } from './agent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Equal, LessThan, MoreThan, Repository } from 'typeorm';
@Injectable()
export class AgentService {
  constructor(@InjectRepository(AgentEntity) private agentRepository: Repository<AgentEntity>) {}

  getHello(): string {
    return 'Hello World!';
  }

  addAgent(AgentData: CreateAgentDto): Promise<AgentEntity> {
    const newAgent = this.agentRepository.create(AgentData);
    return this.agentRepository.save(newAgent);
  }

  async deleteAgent(id: string): Promise<object> {
    const result=await this.agentRepository.delete(id);
    if(result.affected===0){
      return {message:'Agent not found'};
    }
    return { message: 'Agent deleted successfully'};
  }

  getAllAgents(): Promise<AgentEntity[]> {
    const agents = this.agentRepository.find({
    relations:['products']
    });
    return agents;
  }

  async partialUpdateAgent(id: string, AgentData: PatchAgentDto): Promise<object| null> {
    const agent= await this.agentRepository.update(parseInt(id), AgentData)
    if(agent==null){
      return {message:'Agent not found'};
    }
    console.log(AgentData);
    return this.agentRepository.findOneBy({id: parseInt(id)}); 
  }

  updateAgent(id: string, AgentData: CreateAgentDto): object {
    return { message: 'Agent updated successfully!', values: AgentData };
  }



  async updateProfileImage(id: number, imagePath: string): Promise<object> {
    const agent = await this.agentRepository.findOneBy({id});
    const fs = require('fs');
    if (agent==null) {
      fs.unlinkSync(imagePath);
      return { message: 'Agent not found' };
    }

    const username = agent.fullName?.replace(/\s+/g, '_') || 'user';
    const ext = imagePath.split('.').pop();
    const newFileName = `${Date.now()}_${username}.${ext}`;
    const newFilePath = `uploads/${newFileName}`;


    fs.renameSync(imagePath, newFilePath);
    agent.nidImage = newFilePath;
    await this.agentRepository.update(id, agent);
    return {message: 'Profile image updated successfully!', imagePath: newFilePath, agentId: id, agentName: agent.fullName};
  }

  async getImages(id: number, @Res() res): Promise<void> {
    const agent = await this.agentRepository.findOneBy({id});
    if (agent==null) {
      res.status(404).send('Agent not found');
      return;
    }
    else if (!agent.nidImage) {
      res.status(404).send('Image not found');
      return;
    }
    res.sendFile(agent.nidImage,{ root: '.' });
    return;

  }

    getAgentsbyQuery(field: any, data: any): object {
    const result = this.agentRepository.find({
     where: {[field]: data},
    });
    return result;
    }


  getAgentListbyAge(age: number, filter: 'upper' | 'lower' | 'equal'): Promise<AgentEntity[]> {
  let condition: object = { age: Equal(age) };
    if (filter === 'upper') {
      condition = { age: MoreThan(age) };
    } else if (filter === 'lower') {
      condition = { age: LessThan(age) };
    } else if (filter === 'equal') {
      condition = { age: Equal(age) };
    }
    return this.agentRepository.find({
      where: condition,
    });
  }
}
