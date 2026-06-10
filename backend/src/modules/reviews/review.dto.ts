import { IsBoolean, IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min, IsArray } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  museum!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @IsOptional()
  @IsBoolean()
  recommend?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  easeRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  facilitiesRating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @IsOptional()
  @IsBoolean()
  recommend?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  easeRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  facilitiesRating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
