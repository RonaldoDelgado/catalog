import { PartialType } from '@nestjs/mapped-types';
import { CreateListPriceDto } from './create-list-price.dto';

export class UpdateListPriceDto extends PartialType(CreateListPriceDto) {}
