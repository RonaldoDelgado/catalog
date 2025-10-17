import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../entities/product.entity';
import { ListPrice } from '../entities/list-price.entity';
import { PriceXList } from '../entities/price-x-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ListPrice, PriceXList])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
