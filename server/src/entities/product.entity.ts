import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PriceXList } from './price-x-list.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'upc_code' })
  upcCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  dimensions: string;

  @Column({ type: 'text', nullable: true, name: 'other_expectations' })
  otherExpectations: string;

  @OneToMany(() => PriceXList, (priceXList) => priceXList.product)
  priceXLists: PriceXList[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
