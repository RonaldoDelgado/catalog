import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCatalogSettingsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
