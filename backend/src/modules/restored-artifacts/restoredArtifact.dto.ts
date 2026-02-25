import { IsMongoId, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateRestoredArtifactDto {
  @IsMongoId()
  artifact!: string;

  @IsString()
  @IsUrl()
  originalImageUrl!: string;
}

export class UpdateRestoredArtifactDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  restoredImageUrl?: string;

  @IsOptional()
  @IsString()
  status?: 'pending' | 'completed' | 'failed';
}
