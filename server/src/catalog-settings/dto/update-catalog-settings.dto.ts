import { PartialType } from '@nestjs/mapped-types';
import { CreateCatalogSettingsDto } from './create-catalog-settings.dto';

export class UpdateCatalogSettingsDto extends PartialType(
  CreateCatalogSettingsDto,
) {}
