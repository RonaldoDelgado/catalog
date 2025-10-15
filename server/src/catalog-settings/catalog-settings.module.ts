import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogSettingsService } from './catalog-settings.service';
import { CatalogSettingsController } from './catalog-settings.controller';
import { CatalogSettings } from '../entities/catalog-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CatalogSettings])],
  controllers: [CatalogSettingsController],
  providers: [CatalogSettingsService],
  exports: [CatalogSettingsService],
})
export class CatalogSettingsModule {}
