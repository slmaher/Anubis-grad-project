import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  receiver!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;
}

export class MarkAsReadDto {
  @IsOptional()
  @IsMongoId()
  messageId?: string;
}
