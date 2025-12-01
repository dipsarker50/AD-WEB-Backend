import { BadRequestException, Injectable, Res} from '@nestjs/common';
import { CreateAgentDto,LoginAgentDto,PatchAgentDto } from './agent.dto';
import { AgentEntity } from './agent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Equal, LessThan, MoreThan, Repository } from 'typeorm';
import { AgentImageEntity } from './agentImage.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/auth/Mailer/mailer.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AgentService {
  constructor(@InjectRepository(AgentEntity) private agentRepository: Repository<AgentEntity>,@InjectRepository(AgentImageEntity) private agentImageRepository: Repository<AgentImageEntity>,
  private jwtService: JwtService,  private mailService: MailService ) {}

  getHello(): string {
    return 'Hello World!';
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
    const agent = await this.agentRepository.findOne({
      where: { id },
      relations: ['agentImage'],
    });
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
    if (!agent.agentImage) {
    agent.agentImage = this.agentImageRepository.create({
      nidImagePath: newFilePath
    });
    } else {
      agent.agentImage.nidImagePath = newFilePath;
    }
    await this.agentRepository.save(agent);
    return {message: 'Profile image updated successfully!', imagePath: newFilePath, agentId: id, agentName: agent.fullName};
  }

  async getImages(id: number, @Res() res): Promise<void> {
    const agent = await this.agentRepository.findOne({where: { id }, relations: ['agentImage']});
    if (agent==null) {
      res.status(404).send('Agent not found');
      return;
    }
    else if (!agent.agentImage || !agent.agentImage.nidImagePath) {
      res.status(404).send('Image not found');
      return;
    }
    res.sendFile(agent.agentImage.nidImagePath,{ root: '.' });
    return;

  }

    async getAgentsbyQuery(field: any, data: any): Promise<object> {
    const result = await this.agentRepository.find({
     where: {[field]: data},
    });
    return result.map(agent => ({
      fullName: agent.fullName,
      id: agent.id
    }));
    }


  async getAgentListbyAge(age: number, filter: 'upper' | 'lower' | 'equal'): Promise<AgentEntity[]> {
  let condition: object = { age: Equal(age) };
    if (filter === 'upper') {
      condition = { age: MoreThan(age) };
    } else if (filter === 'lower') {
      condition = { age: LessThan(age) };
    } else if (filter === 'equal') {
      condition = { age: Equal(age) };
    }
    const agents = this.agentRepository.find({
      where: condition,
      select: ['id', 'fullName'],
    })

    return agents;
  }

  async getAgentProducts(id: string): Promise<object> {
    let data=await this.agentRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['products'],
      select: {
        id: true,
        fullName: true,
        products: {
          id: true,
          name: true,
          price: true,
        },
      },
    });
    console.log(data);
    if(data==null){
      return {message:'No Product Listed for this Agent'};
    }
    return data;
  }

  async updatePassword(id: string, agent: PatchAgentDto): Promise<object> {
    const salt=await bcrypt.genSalt();
    if(await this.agentRepository.findOneBy({id: parseInt(id)})==null){
      return {message:'Agent not found'};
    }else if(agent.password==null){
      return {message:'Password not provided'};
    }
    const hashedPassword=await bcrypt.hash(agent.password,salt);
    await this.agentRepository.update(parseInt(id),{password:hashedPassword});
    return {message:'Password updated successfully'};
  }


  async loginAgent(loginAgentDto: LoginAgentDto): Promise<object> {
    const agent = await this.agentRepository.findOneBy({ email: loginAgentDto.email });
    if (!agent) {
      return { message: 'Invalid email or password' };
    }else if(!agent.isEmailVerified){
      return { message: 'Email not verified. Please verify your email before logging in.' };
    }
    const result = await bcrypt.compare(loginAgentDto.password, agent.password);
    if (!result) {
      return { message: 'Invalid email or password' };
    }
    const payload = { email: agent.email, sub: agent.id ,role:'agent'};
    const access_token = this.jwtService.sign(payload);
    return { message: 'Login successful', agentId: agent.id, agentName: agent.fullName, access_token };
  }

  async addAgent(AgentData: CreateAgentDto): Promise<object> {
      const existing = await this.agentRepository.findOne({
        where: { email: AgentData.email }
      });
      
      if (existing) {
        throw new BadRequestException('Email already registered');
      }
      
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(AgentData.password, salt);
      
      // Generate verification token
      const verificationToken = uuidv4();
      const verificationTokenExpiry = new Date();
      verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);
      
      // Create agent
        const newAgent = this.agentRepository.create({
        ...AgentData,                    // Spread DTO data
        password: hashedPassword,        // Override password with hash
        isEmailVerified: false,          // Add verification fields
        verificationToken: verificationToken,
        verificationTokenExpiry: verificationTokenExpiry,
      });
      
      await this.agentRepository.save(newAgent);
      
      await this.mailService.sendVerificationEmail(
        AgentData.email,
        verificationToken,
        AgentData.fullName
      );
      
      return {
        message: 'Registration successful! Check your email to verify.',
        agentId: AgentData.fullName,
      };
 }

  
  async verifyEmail(token: string): Promise<object> {
  const agent = await this.agentRepository.findOne({
    where: { verificationToken: token }
  });
  
  if (!agent) {
    throw new BadRequestException('Invalid token');
  }
  
  if (agent.isEmailVerified) {
    return { message: 'Email already verified' };
  }
  
  if (agent.verificationTokenExpiry!=null) {
    if (new Date() > agent.verificationTokenExpiry) {
     throw new BadRequestException('Token expired');
    }
  }

  
  agent.isEmailVerified = true;
  agent.verificationToken = null;
  agent.verificationTokenExpiry = null;
  
  await this.agentRepository.save(agent);
  
  return { message: 'Email verified successfully!' };
  }
}