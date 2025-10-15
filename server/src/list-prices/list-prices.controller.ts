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
import { ListPricesService } from './list-prices.service';
import { CreateListPriceDto } from './dto/create-list-price.dto';
import { UpdateListPriceDto } from './dto/update-list-price.dto';

@Controller('list-prices')
export class ListPricesController {
  constructor(private readonly listPricesService: ListPricesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createListPriceDto: CreateListPriceDto) {
    return this.listPricesService.create(createListPriceDto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    if (search) {
      return this.listPricesService.search(search);
    }
    return this.listPricesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.listPricesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateListPriceDto: UpdateListPriceDto,
  ) {
    return this.listPricesService.update(id, updateListPriceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.listPricesService.remove(id);
  }
}
