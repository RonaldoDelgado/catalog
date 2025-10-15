import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create(createProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException(
          'Product with this code or UPC code already exists',
        );
      }
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['priceXLists', 'priceXLists.listPrice'],
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['priceXLists', 'priceXLists.listPrice'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByCode(code: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { code },
      relations: ['priceXLists', 'priceXLists.listPrice'],
    });

    if (!product) {
      throw new NotFoundException(`Product with code ${code} not found`);
    }

    return product;
  }

  async findByUpcCode(upcCode: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { upcCode },
      relations: ['priceXLists', 'priceXLists.listPrice'],
    });

    if (!product) {
      throw new NotFoundException(`Product with UPC code ${upcCode} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    try {
      Object.assign(product, updateProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Product with this code or UPC code already exists',
        );
      }
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async search(query: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where(
        'product.title ILIKE :query OR product.code ILIKE :query OR product.upcCode ILIKE :query OR product.description ILIKE :query',
        { query: `%${query}%` },
      )
      .leftJoinAndSelect('product.priceXLists', 'priceXLists')
      .leftJoinAndSelect('priceXLists.listPrice', 'listPrice')
      .getMany();
  }
}
