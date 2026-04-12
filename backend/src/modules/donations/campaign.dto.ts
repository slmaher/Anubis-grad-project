import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  goalAmount!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  goalAmount?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  isActive?: boolean;
}
