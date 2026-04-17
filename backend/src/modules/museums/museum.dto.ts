import { IsOptional, IsString, Matches, MinLength } from "class-validator";

const IMAGE_URL_OR_DATA_URL_PATTERN =
  /^(https?:\/\/[^\s]+|data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\r\n]+)$/;

export class CreateMuseumDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  @MinLength(2)
  location!: string;

  @IsString()
  @MinLength(2)
  city!: string;

  @IsOptional()
  @IsString()
  @Matches(IMAGE_URL_OR_DATA_URL_PATTERN, {
    message: "imageUrl must be an http(s) URL or a base64 data URL",
  })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;
}

export class UpdateMuseumDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  location?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(IMAGE_URL_OR_DATA_URL_PATTERN, {
    message: "imageUrl must be an http(s) URL or a base64 data URL",
  })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;
}
