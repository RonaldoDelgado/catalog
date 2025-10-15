import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsObject,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class DimensionsDto {
  @IsOptional()
  @Type(() => Number)
  length?: number;

  @IsOptional()
  @Type(() => Number)
  width?: number;

  @IsOptional()
  @Type(() => Number)
  height?: number;

  @IsOptional()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

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
  @IsObject()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;
}
