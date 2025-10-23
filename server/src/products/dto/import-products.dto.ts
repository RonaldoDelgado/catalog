import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class ImportProductRowDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsString()
  otherExpectations?: string;

  @IsString()
  @IsNotEmpty()
  upcCode: string;

  @IsOptional()
  @IsObject()
  prices?: { [listPriceName: string]: number };
}

export class ImportProductsDto {
  @IsString()
  @IsNotEmpty()
  csvData: string;
}

export interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
  details: {
    productId?: string;
    title: string;
    error?: string;
    action?: 'created' | 'updated';
  }[];
}
