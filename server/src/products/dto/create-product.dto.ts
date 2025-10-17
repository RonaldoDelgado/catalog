import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  upcCode: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsString()
  otherExpectations?: string;
}
