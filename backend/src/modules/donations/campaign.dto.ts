import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateCampaignDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  goalAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  suggestedAmount?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  icon?: string;
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
  @IsNumber()
  @Min(0)
  suggestedAmount?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}