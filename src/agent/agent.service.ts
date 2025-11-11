import { Injectable} from '@nestjs/common';
import { CreateAgentDto,PatchAgentDto } from './agent.dto';
@Injectable()
export class AgentService {
  getHello(): string {
    return 'Hello World!';
  }

  addAgent(AgentData: CreateAgentDto): object {
    return { name: AgentData.fullName,phone:AgentData.phone};
  }

  deleteAgent(id: string): object {
    return { message: 'Agent deleted successfully!'};
  }

  getAllAgents(): object {
    return { name: 'Agent1', email: 'Agent1@example.com'};
  }

  partialUpdateAgent(id: string, AgentData: PatchAgentDto): object {
    return { message: 'Agent updated successfully!',  values: AgentData };
  }

  updateAgent(id: string, AgentData: CreateAgentDto): object {
    return { message: 'Agent updated successfully!', values: AgentData };
  }
  
  getAgentsIDbyPhone(phone: string): string {
      return "1";
  }

  updateProfileImage(id: string, imagePath: string): object {
    const agent = this.getAgentbyID(id);
    agent.nidImage = imagePath;
    const username = agent.fullName?.replace(/\s+/g, '_') || 'user';
    const ext = imagePath.split('.').pop();
    const newFileName = `${Date.now()}_${username}.${ext}`;
    const newFilePath = `uploads/${newFileName}`;

    const fs = require('fs');
    fs.renameSync(imagePath, newFilePath);
    console.log(agent);
    return {message:`Profile Picture ${id} to ${newFilePath}`};
  }

  getAgentbyID(id: string): PatchAgentDto {
    return { fullName: 'Agent1', nidImage: "sample.jpg" };
  }

}
