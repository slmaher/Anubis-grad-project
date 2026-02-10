import { IsMongoId, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateArtifactDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsMongoId()
  museum!: string;

  @IsOptional()
  @IsString()
  era?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateArtifactDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsMongoId()
  museum?: string;

  @IsOptional()
  @IsString()
  era?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;
}
