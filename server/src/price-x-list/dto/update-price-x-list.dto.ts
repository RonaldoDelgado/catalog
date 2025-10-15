import { PartialType } from '@nestjs/mapped-types';
import { CreatePriceXListDto } from './create-price-x-list.dto';

export class UpdatePriceXListDto extends PartialType(CreatePriceXListDto) {}
