import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ListPrice } from '../entities/list-price.entity';
import { PriceXList } from '../entities/price-x-list.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImportResult } from './dto/import-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ListPrice)
    private readonly listPriceRepository: Repository<ListPrice>,
    @InjectRepository(PriceXList)
    private readonly priceXListRepository: Repository<PriceXList>,
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

  async importFromCSV(csvData: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      created: 0,
      errors: [],
      details: [],
    };

    try {
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        throw new BadRequestException('CSV file must have at least a header and one data row');
      }

      // Parse header to identify columns
      const headers = lines[0].split('\t').map(h => h.trim());
      
      // Find basic product columns
      const basicColumns = ['title', 'code', 'description', 'imageUrl', 'dimensions', 'otherExpectations', 'upcCode'];
      const columnIndexes: { [key: string]: number } = {};
      
      basicColumns.forEach(col => {
        const index = headers.findIndex(h => h.toLowerCase() === col.toLowerCase());
        if (index !== -1) {
          columnIndexes[col] = index;
        }
      });

      // Identify price list columns (everything after basic columns)
      const priceColumns: { name: string; index: number }[] = [];
      headers.forEach((header, index) => {
        if (!basicColumns.some(col => col.toLowerCase() === header.toLowerCase())) {
          priceColumns.push({ name: header, index });
        }
      });

      // Get existing list prices to match with CSV columns
      const listPrices = await this.listPriceRepository.find();
      const listPriceMap = new Map<string, ListPrice>();
      listPrices.forEach(lp => {
        listPriceMap.set(lp.title.toLowerCase(), lp);
      });

      // Log available price lists for debugging
      console.log('Available price lists:', listPrices.map(lp => lp.title));
      console.log('Price columns found in CSV:', priceColumns.map(pc => pc.name));

      // Process each data row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t').map(v => v.trim());
        
        if (values.length === 0 || values.every(v => !v)) {
          continue; // Skip empty rows
        }

        console.log(`Processing row ${i + 1}:`, values);
        
        try {
          // Create product data
          const productData: CreateProductDto = {
            title: values[columnIndexes.title] || '',
            code: values[columnIndexes.code] || '',
            upcCode: values[columnIndexes.upcCode] || '',
            description: values[columnIndexes.description] || undefined,
            imageUrl: values[columnIndexes.imageUrl] || undefined,
            dimensions: values[columnIndexes.dimensions] || undefined,
            otherExpectations: values[columnIndexes.otherExpectations] || undefined,
          };

          console.log(`Product data for row ${i + 1}:`, productData);

          // Validate required fields
          if (!productData.title || !productData.code || !productData.upcCode) {
            result.errors.push(`Row ${i + 1}: Missing required fields (title, code, or upcCode)`);
            result.details.push({
              title: productData.title || 'Unknown',
              error: 'Missing required fields',
            });
            continue;
          }

          // Create product
          let product: Product;
          try {
            product = await this.create(productData);
            result.created++;
            result.details.push({
              productId: product.id,
              title: product.title,
            });
          } catch (createError) {
            // Handle product creation errors (like duplicates)
            const errorMessage = createError.message || 'Failed to create product';
            result.errors.push(`Row ${i + 1}: ${errorMessage}`);
            result.details.push({
              title: productData.title,
              error: errorMessage,
            });
            continue; // Skip to next product
          }

          // Create prices for this product
          for (const priceCol of priceColumns) {
            const priceValue = parseFloat(values[priceCol.index]);
            if (!isNaN(priceValue) && priceValue > 0) {
              const listPrice = listPriceMap.get(priceCol.name.toLowerCase());
              if (listPrice) {
                try {
                  await this.priceXListRepository.save({
                    productId: product.id,
                    listPriceId: listPrice.id,
                    price: priceValue,
                  });
                } catch (priceError) {
                  result.errors.push(`Row ${i + 1}: Failed to set price for "${priceCol.name}"`);
                }
              } else {
                result.errors.push(`Row ${i + 1}: Price list "${priceCol.name}" not found`);
              }
            }
          }

        } catch (error) {
          const errorMessage = error.message || 'Unknown error';
          result.errors.push(`Row ${i + 1}: ${errorMessage}`);
          result.details.push({
            title: values[columnIndexes.title] || 'Unknown',
            error: errorMessage,
          });
        }
      }

      result.success = result.created > 0;
      return result;

    } catch (error) {
      result.errors.push(`General error: ${error.message}`);
      return result;
    }
  }
}
