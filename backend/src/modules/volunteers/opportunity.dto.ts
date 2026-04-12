import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateOpportunityDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  requirements!: string;

  @IsString()
  location!: string;

  @IsString()
  duration!: string;
}

export class UpdateOpportunityDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
