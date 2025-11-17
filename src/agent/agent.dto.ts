import {IsOptional, IsString, IsNumber, Min, IsInt, Matches, IsEmail, IsEnum} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { AgentStatus } from './agent.entity';

export class CreateAgentDto {

  @IsString()
  @Matches(/^[A-Za-z\s]+$/, { message: 'Name Should be only contain Alphabets' })
  fullName: string;

  @IsString() 
  address: string;

  @Matches(/^[^\s@]+@[^\s@]+\.xyz$/, { message: 'Email must be a valid .xyz domain email' })
  email: string;

  @IsString() 
  phone: string;

  @IsNumber()
  @Min(18, { message: 'Age must be at least 18' })
  age: number;

  @IsString() 
  @IsOptional() 
  experience?: string;


  @IsString() 
  @IsOptional() 
  bio?: string;

  @IsString()
  @Matches(/^\d{10}$|^\d{13}$|^\d{17}$/, { message: 'NID must be 10, 13, or 17 digits long'})
  nidNumber: string;

  @IsString() 
  @IsOptional() 
  nidImage?: string;

  @IsEnum(AgentStatus)
  @IsOptional()
  status?:AgentStatus;
  
}

export class PatchAgentDto extends PartialType(CreateAgentDto) {}
