import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceXListService } from './price-x-list.service';
import { PriceXListController } from './price-x-list.controller';
import { PriceXList } from '../entities/price-x-list.entity';
import { Product } from '../entities/product.entity';
import { ListPrice } from '../entities/list-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceXList, Product, ListPrice])],
  controllers: [PriceXListController],
  providers: [PriceXListService],
  exports: [PriceXListService],
})
export class PriceXListModule {}
