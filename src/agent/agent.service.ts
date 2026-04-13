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
import { CreateProductDto } from 'src/product/product.dto';
import { ProductEntity } from 'src/product/product.entity';
import { PusherService } from 'src/pusher/pusher.service';
import { SupabaseService } from 'src/storage/supabase.service';
@Injectable()
export class AgentService {
  constructor(@InjectRepository(AgentEntity) private agentRepository: Repository<AgentEntity>,@InjectRepository(AgentImageEntity) private agentImageRepository: Repository<AgentImageEntity>,
  private jwtService: JwtService,  private mailService: MailService, private pusherService: PusherService,
  private readonly supabaseService: SupabaseService,
  @InjectRepository(ProductEntity) private productRepository: Repository<ProductEntity>
 ) {}

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

  async partialUpdateAgent(id: number, AgentData: PatchAgentDto): Promise<object| null> {
    const agent= await this.agentRepository.findOneBy({id: id});
    if(agent==null){
      return {message:'Agent not found'};
    }
    const updateData = { ...agent, ...AgentData };
    await this.agentRepository.save(updateData);
    return this.agentRepository.findOneBy({id: id}); 
  }

  updateAgent(id: string, AgentData: CreateAgentDto): object {
    return { message: 'Agent updated successfully!', values: AgentData };
  }

  async updateProfileImage(id: number, imageUrl: string): Promise<object> {
    const agent = await this.agentRepository.findOne({
      where: { id },
      relations: ['agentImage'],
    });

    if (agent==null) {
      return { message: 'Agent not found' };
    }

    // Store the Supabase URL directly in the database
    if (!agent.agentImage) {
      agent.agentImage = this.agentImageRepository.create({
        nidImagePath: imageUrl // Now stores Supabase URL instead of local path
      });
    } else {
      agent.agentImage.nidImagePath = imageUrl;
    }
    
    await this.agentRepository.save(agent);
    return {
      message: 'Profile image updated successfully!', 
      imageUrl,
      imagePath: imageUrl,
      agentId: id, 
      agentName: agent.fullName
    };
  }

  async getImages(id: number, @Res() res): Promise<void> {
    const agent = await this.agentRepository.findOne({where: { id }, relations: ['agentImage']});
    if (agent==null) {
      res.status(404).json({message: 'Agent not found'});
      return;
    }
    else if (!agent.agentImage || !agent.agentImage.nidImagePath) {
      res.status(404).json({message: 'Image not found'});
      return;
    }
    
    // Since we're using Supabase URLs, return the URL in JSON format
    // Frontend can use this URL directly to display images
    res.json({
      success: true,
      imageUrl: this.supabaseService.toDisplayUrl(agent.agentImage.nidImagePath),
      message: 'Image URL retrieved successfully'
    });
    return;
  }

    async getAgentsbyQuery(field: any, data: any): Promise<object> {
    const result = await this.agentRepository.find({
     where: {[field]: data},
    });
    return result;
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

  async getAgentProducts(id: number): Promise<object> {
    let data=await this.agentRepository.findOne({
      where: { id: id },
      relations: ['products'],
      // select: {
      //   id: true,
      //   fullName: true,
      //   products: {
      //     id: true,
      //     name: true,
      //     price: true,
      //   },
      // },
    });

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
      return { message: 'Not a verified agent', success: false  };
    }else if(!agent.isEmailVerified){
      return { message: 'Email not verified. Please verify your email before logging in.',success: false };
    }
    const result = await bcrypt.compare(loginAgentDto.password, agent.password);
    if (!result) {
      return { message: 'Invalid email or password' ,success:false};
    }

    
    const payload = { email: agent.email, sub: agent.id ,role:'agent'};
    const access_token = this.jwtService.sign(payload);
    console.log(payload);
    
    await this.pusherService.trigger('agent-login', 'agent-login-channel', {

          message: ` Hey ${agent.fullName}, Login successful`,
          timestamp: new Date().toISOString(),
        });
    return { message: 'Login successful', agentId: agent.id, agentName: agent.fullName, access_token,success:true };
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
      
      const verificationToken = uuidv4();
      const verificationTokenExpiry = new Date();
      verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);
      
      const newAgent = this.agentRepository.create({
        ...AgentData,                    
        password: hashedPassword,        
        isEmailVerified: false,         
        verificationToken: verificationToken,
        verificationTokenExpiry: verificationTokenExpiry,
      });
      
      await this.agentRepository.save(newAgent);
      
      await this.mailService.sendVerificationEmail(
        AgentData.email,
        verificationToken,
        AgentData.fullName
      );

        await this.pusherService.trigger('agent-verification', 'verification-status-checked', {

          message: ` Hey ${AgentData.fullName}, Verification email sent`,
          timestamp: new Date().toISOString(),
        });
      
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

  async createAgentProduct(id: string, productData: CreateProductDto): Promise<object> {
    const agentId = parseInt(id);
    const product = {
      ...productData,
      agentId: agentId,
    };

    await this.productRepository.save(product);

    
    return { message: 'Product created successfully', product };
  }

  async checkVerificationStatus(email: string): Promise<boolean> {
    const data = await this.agentRepository.findOne({
      where: { email: email },
      select: ['id', 'fullName', 'isEmailVerified'],
    });
    return data ? data.isEmailVerified : false;
  }
}