import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ListPricesModule } from '../list-prices/list-prices.module';
import { PriceXListModule } from '../price-x-list/price-x-list.module';
import { CatalogSettingsModule } from '../catalog-settings/catalog-settings.module';

@Module({
  imports: [
    ProductsModule,
    ListPricesModule,
    PriceXListModule,
    CatalogSettingsModule,
  ],
  exports: [
    ProductsModule,
    ListPricesModule,
    PriceXListModule,
    CatalogSettingsModule,
  ],
})
export class CatalogModule {}
