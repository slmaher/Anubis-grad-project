import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateDonationDto {
  @IsMongoId()
  museum!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class UpdateDonationDto {
  @IsOptional()
  @IsString()
  status?: 'pending' | 'completed' | 'failed';
}
