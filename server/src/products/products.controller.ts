import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImportProductsDto } from './dto/import-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  importFromCSV(@Body(ValidationPipe) importData: ImportProductsDto) {
    return this.productsService.importFromCSV(importData.csvData);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    if (search) {
      return this.productsService.search(search);
    }
    return this.productsService.findAll();
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.productsService.findByCode(code);
  }

  @Get('upc/:upcCode')
  findByUpcCode(@Param('upcCode') upcCode: string) {
    return this.productsService.findByUpcCode(upcCode);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
