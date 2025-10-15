import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceXList } from '../entities/price-x-list.entity';
import { Product } from '../entities/product.entity';
import { ListPrice } from '../entities/list-price.entity';
import { CreatePriceXListDto } from './dto/create-price-x-list.dto';
import { UpdatePriceXListDto } from './dto/update-price-x-list.dto';

@Injectable()
export class PriceXListService {
  constructor(
    @InjectRepository(PriceXList)
    private readonly priceXListRepository: Repository<PriceXList>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ListPrice)
    private readonly listPriceRepository: Repository<ListPrice>,
  ) {}

  async create(createPriceXListDto: CreatePriceXListDto): Promise<PriceXList> {
    // Verificar que el producto existe
    const product = await this.productRepository.findOne({
      where: { id: createPriceXListDto.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createPriceXListDto.productId} not found`,
      );
    }

    // Verificar que la lista de precios existe
    const listPrice = await this.listPriceRepository.findOne({
      where: { id: createPriceXListDto.listPriceId },
    });
    if (!listPrice) {
      throw new NotFoundException(
        `List price with ID ${createPriceXListDto.listPriceId} not found`,
      );
    }

    try {
      const priceXList = this.priceXListRepository.create(createPriceXListDto);
      return await this.priceXListRepository.save(priceXList);
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException(
          'Price already exists for this product and list combination',
        );
      }
      throw new BadRequestException('Failed to create price');
    }
  }

  async findAll(): Promise<PriceXList[]> {
    return await this.priceXListRepository.find({
      relations: ['product', 'listPrice'],
    });
  }

  async findOne(id: string): Promise<PriceXList> {
    const priceXList = await this.priceXListRepository.findOne({
      where: { id },
      relations: ['product', 'listPrice'],
    });

    if (!priceXList) {
      throw new NotFoundException(`Price with ID ${id} not found`);
    }

    return priceXList;
  }

  async findByProductAndList(
    productId: string,
    listPriceId: string,
  ): Promise<PriceXList> {
    const priceXList = await this.priceXListRepository.findOne({
      where: { productId, listPriceId },
      relations: ['product', 'listPrice'],
    });

    if (!priceXList) {
      throw new NotFoundException(
        `Price not found for product ${productId} and list ${listPriceId}`,
      );
    }

    return priceXList;
  }

  async findByProduct(productId: string): Promise<PriceXList[]> {
    return await this.priceXListRepository.find({
      where: { productId },
      relations: ['product', 'listPrice'],
    });
  }

  async findByListPrice(listPriceId: string): Promise<PriceXList[]> {
    return await this.priceXListRepository.find({
      where: { listPriceId },
      relations: ['product', 'listPrice'],
    });
  }

  async update(
    id: string,
    updatePriceXListDto: UpdatePriceXListDto,
  ): Promise<PriceXList> {
    const priceXList = await this.findOne(id);

    // Si se está actualizando productId o listPriceId, verificar que existen
    if (updatePriceXListDto.productId) {
      const product = await this.productRepository.findOne({
        where: { id: updatePriceXListDto.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${updatePriceXListDto.productId} not found`,
        );
      }
    }

    if (updatePriceXListDto.listPriceId) {
      const listPrice = await this.listPriceRepository.findOne({
        where: { id: updatePriceXListDto.listPriceId },
      });
      if (!listPrice) {
        throw new NotFoundException(
          `List price with ID ${updatePriceXListDto.listPriceId} not found`,
        );
      }
    }

    try {
      Object.assign(priceXList, updatePriceXListDto);
      return await this.priceXListRepository.save(priceXList);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Price already exists for this product and list combination',
        );
      }
      throw new BadRequestException('Failed to update price');
    }
  }

  async remove(id: string): Promise<void> {
    const priceXList = await this.findOne(id);
    await this.priceXListRepository.remove(priceXList);
  }
}
