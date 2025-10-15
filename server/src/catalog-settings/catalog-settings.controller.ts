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
import { CatalogSettingsService } from './catalog-settings.service';
import { CreateCatalogSettingsDto } from './dto/create-catalog-settings.dto';
import { UpdateCatalogSettingsDto } from './dto/update-catalog-settings.dto';

@Controller('catalog-settings')
export class CatalogSettingsController {
  constructor(
    private readonly catalogSettingsService: CatalogSettingsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(ValidationPipe) createCatalogSettingsDto: CreateCatalogSettingsDto,
  ) {
    return this.catalogSettingsService.create(createCatalogSettingsDto);
  }

  @Get()
  findAll() {
    return this.catalogSettingsService.findAll();
  }

  @Get('key/:key')
  findByKey(@Param('key') key: string) {
    return this.catalogSettingsService.findByKey(key);
  }

  @Get('catalog-visibility')
  async getCatalogVisibility() {
    const isVisible = await this.catalogSettingsService.isCatalogVisible();
    return { visible: isVisible };
  }

  @Post('catalog-visibility')
  async setCatalogVisibility(@Body() body: { visible: boolean }) {
    const setting = await this.catalogSettingsService.setCatalogVisibility(
      body.visible,
    );
    return { visible: setting.value === 'true' };
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogSettingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCatalogSettingsDto: UpdateCatalogSettingsDto,
  ) {
    return this.catalogSettingsService.update(id, updateCatalogSettingsDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogSettingsService.remove(id);
  }
}
