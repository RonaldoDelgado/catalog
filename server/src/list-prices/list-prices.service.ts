import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListPrice } from '../entities/list-price.entity';
import { CreateListPriceDto } from './dto/create-list-price.dto';
import { UpdateListPriceDto } from './dto/update-list-price.dto';

@Injectable()
export class ListPricesService {
  constructor(
    @InjectRepository(ListPrice)
    private readonly listPriceRepository: Repository<ListPrice>,
  ) {}

  async create(createListPriceDto: CreateListPriceDto): Promise<ListPrice> {
    try {
      const listPrice = this.listPriceRepository.create(createListPriceDto);
      return await this.listPriceRepository.save(listPrice);
    } catch {
      throw new BadRequestException('Failed to create list price');
    }
  }

  async findAll(): Promise<ListPrice[]> {
    return await this.listPriceRepository.find({
      relations: ['priceXLists', 'priceXLists.product'],
    });
  }

  async findOne(id: string): Promise<ListPrice> {
    const listPrice = await this.listPriceRepository.findOne({
      where: { id },
      relations: ['priceXLists', 'priceXLists.product'],
    });

    if (!listPrice) {
      throw new NotFoundException(`List price with ID ${id} not found`);
    }

    return listPrice;
  }

  async update(
    id: string,
    updateListPriceDto: UpdateListPriceDto,
  ): Promise<ListPrice> {
    const listPrice = await this.findOne(id);

    try {
      // If setting this list price as active, deactivate all others first
      if (updateListPriceDto.isActive === true) {
        await this.listPriceRepository.update(
          { isActive: true },
          { isActive: false },
        );
      }

      Object.assign(listPrice, updateListPriceDto);
      return await this.listPriceRepository.save(listPrice);
    } catch {
      throw new BadRequestException('Failed to update list price');
    }
  }

  async remove(id: string): Promise<void> {
    const listPrice = await this.findOne(id);
    await this.listPriceRepository.remove(listPrice);
  }

  async search(query: string): Promise<ListPrice[]> {
    return await this.listPriceRepository
      .createQueryBuilder('listPrice')
      .where(
        'listPrice.title ILIKE :query OR listPrice.description ILIKE :query',
        { query: `%${query}%` },
      )
      .leftJoinAndSelect('listPrice.priceXLists', 'priceXLists')
      .leftJoinAndSelect('priceXLists.product', 'product')
      .getMany();
  }
}
