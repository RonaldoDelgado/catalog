import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogSettings } from '../entities/catalog-settings.entity';
import { CreateCatalogSettingsDto } from './dto/create-catalog-settings.dto';
import { UpdateCatalogSettingsDto } from './dto/update-catalog-settings.dto';

@Injectable()
export class CatalogSettingsService {
  constructor(
    @InjectRepository(CatalogSettings)
    private readonly catalogSettingsRepository: Repository<CatalogSettings>,
  ) {}

  async create(
    createCatalogSettingsDto: CreateCatalogSettingsDto,
  ): Promise<CatalogSettings> {
    try {
      const setting = this.catalogSettingsRepository.create(
        createCatalogSettingsDto,
      );
      return await this.catalogSettingsRepository.save(setting);
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException(
          `Setting with key '${createCatalogSettingsDto.key}' already exists`,
        );
      }
      throw new BadRequestException('Failed to create catalog setting');
    }
  }

  async findAll(): Promise<CatalogSettings[]> {
    return await this.catalogSettingsRepository.find();
  }

  async findOne(id: string): Promise<CatalogSettings> {
    const setting = await this.catalogSettingsRepository.findOne({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException(`Catalog setting with ID ${id} not found`);
    }

    return setting;
  }

  async findByKey(key: string): Promise<CatalogSettings> {
    const setting = await this.catalogSettingsRepository.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(
        `Catalog setting with key '${key}' not found`,
      );
    }

    return setting;
  }

  async update(
    id: string,
    updateCatalogSettingsDto: UpdateCatalogSettingsDto,
  ): Promise<CatalogSettings> {
    const setting = await this.findOne(id);

    try {
      Object.assign(setting, updateCatalogSettingsDto);
      return await this.catalogSettingsRepository.save(setting);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Setting with key '${updateCatalogSettingsDto.key}' already exists`,
        );
      }
      throw new BadRequestException('Failed to update catalog setting');
    }
  }

  async updateByKey(key: string, value: string): Promise<CatalogSettings> {
    const setting = await this.findByKey(key);
    setting.value = value;
    return await this.catalogSettingsRepository.save(setting);
  }

  async remove(id: string): Promise<void> {
    const setting = await this.findOne(id);
    await this.catalogSettingsRepository.remove(setting);
  }

  // Helper methods for common settings
  async isCatalogVisible(): Promise<boolean> {
    try {
      const setting = await this.findByKey('catalog_visible');
      return setting.value === 'true';
    } catch {
      // If setting doesn't exist, default to true
      return true;
    }
  }

  async setCatalogVisibility(visible: boolean): Promise<CatalogSettings> {
    try {
      return await this.updateByKey('catalog_visible', visible.toString());
    } catch {
      // If setting doesn't exist, create it
      return await this.create({
        key: 'catalog_visible',
        value: visible.toString(),
        description: 'Controls whether the product catalog is visible to users',
      });
    }
  }
}
