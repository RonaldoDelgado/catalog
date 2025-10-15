import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PriceXListService } from './price-x-list.service';
import { CreatePriceXListDto } from './dto/create-price-x-list.dto';
import { UpdatePriceXListDto } from './dto/update-price-x-list.dto';

@Controller('price-x-list')
export class PriceXListController {
  constructor(private readonly priceXListService: PriceXListService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createPriceXListDto: CreatePriceXListDto) {
    return this.priceXListService.create(createPriceXListDto);
  }

  @Get()
  findAll() {
    return this.priceXListService.findAll();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.priceXListService.findByProduct(productId);
  }

  @Get('list-price/:listPriceId')
  findByListPrice(@Param('listPriceId', ParseUUIDPipe) listPriceId: string) {
    return this.priceXListService.findByListPrice(listPriceId);
  }

  @Get('product/:productId/list-price/:listPriceId')
  findByProductAndList(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('listPriceId', ParseUUIDPipe) listPriceId: string,
  ) {
    return this.priceXListService.findByProductAndList(productId, listPriceId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.priceXListService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updatePriceXListDto: UpdatePriceXListDto,
  ) {
    return this.priceXListService.update(id, updatePriceXListDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.priceXListService.remove(id);
  }
}
