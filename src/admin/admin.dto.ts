import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength,IsEnum} from 'class-validator';
import { PartialType,OmitType } from '@nestjs/mapped-types';


export enum AdminRole {
        SUPER_ADMIN = 'SUPER_ADMIN',
        ADMIN = 'ADMIN',
        MODERATOR = 'MODERATOR',
}

export class Admin {
  uid: number;
  name: string;
  email: string;
  password: string;
  role?: AdminRole;
}

export class CreateAdminDto extends PartialType(Admin) {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;
}

export class UpdatePartialAdminDto extends PartialType( OmitType(Admin, ['uid'] as const)) {

        @IsString()
        @IsOptional()
        name?: string;

        @MinLength(6)
        @IsOptional()
        password?: string;

        @IsOptional()
        @IsEmail()
        email: string;

        @IsOptional()
        @IsEnum(AdminRole)
        role?: AdminRole;
}


export class UpdateAdminDto extends PartialType( OmitType(Admin, ['uid'] as const)) {

        @IsString()
        @IsNotEmpty()
        name?: string;

        @MinLength(6)
        @IsNotEmpty()
        password?: string;


        @IsNotEmpty()
        @IsEmail()
        email: string;

        @IsOptional()
        @IsEnum(AdminRole)
        role?: AdminRole;
}


