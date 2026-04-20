import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOpportunityDto {
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  title!: string;

  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  description!: string;

  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  requirements!: string;

  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  location!: string;

  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  duration!: string;

  @IsOptional()
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  icon?: string;
}

export class UpdateOpportunityDto {
  @IsOptional()
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  title?: string;

  @IsOptional()
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  requirements?: string;

  @IsOptional()
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  location?: string;

  @IsOptional()
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  duration?: string;

  @IsOptional()
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
