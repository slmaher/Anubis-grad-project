import { IsDateString, IsEnum, IsInt, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTicketDto {
  @IsMongoId()
  museum!: string;

  @IsDateString()
  visitDate!: string;

  @IsInt()
  @Min(1)
  numberOfGuests!: number;

  @IsNumber()
  @Min(0)
  totalPrice!: number;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export class UpdateTicketDto {
  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfGuests?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'cancelled';
}
