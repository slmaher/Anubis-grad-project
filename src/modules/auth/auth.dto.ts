import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { UserRole } from '../users/user.roles';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 64)
  password!: string;

  // Optional, but only admins should be able to set this in production flows.
  @IsOptional()
  @IsString()
  role?: UserRole;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 64)
  password!: string;
}

