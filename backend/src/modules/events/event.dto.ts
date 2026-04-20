import {
  IsDateString,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from "class-validator";

const IMAGE_URL_OR_DATA_URL_PATTERN =
  /^(https?:\/\/[^\s]+|data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\r\n]+)$/;

export class CreateEventDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsMongoId()
  museum!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  @Matches(IMAGE_URL_OR_DATA_URL_PATTERN, {
    message: "imageUrl must be an http(s) URL or a base64 data URL",
  })
  imageUrl?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttendees?: number;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsMongoId()
  museum?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  @Matches(IMAGE_URL_OR_DATA_URL_PATTERN, {
    message: "imageUrl must be an http(s) URL or a base64 data URL",
  })
  imageUrl?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttendees?: number;
}
