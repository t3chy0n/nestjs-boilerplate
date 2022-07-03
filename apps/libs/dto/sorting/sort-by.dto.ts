import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SortOrder } from './types';

export class SortByDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'This is used like this' })
  property: string;

  @IsNotEmpty()
  @ApiProperty({
    type: 'SortOrder',
    description: 'This is used like this',
  })
  sort: SortOrder;

  static parse(string: string) {
    const properties = string.split(':');
    const orderProperty = properties[1]?.trim() || 'DESC';

    const order = isNaN(orderProperty as any)
      ? orderProperty?.toUpperCase()
      : Number(orderProperty);

    return new SortByDto(properties[0].trim(), order as SortOrder);
  }

  constructor(property: string, sort: SortOrder) {
    this.property = property;
    this.sort = sort;
  }
}
