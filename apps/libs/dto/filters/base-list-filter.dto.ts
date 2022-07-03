import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationOptionsDto } from '../pagination/pagination-options.dto';
import { SortByDto } from '../sorting/sort-by.dto';
import { TransformSortParams } from '../sorting/transform-sort-params.decorator';
import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseListFilterDto extends PaginationOptionsDto {
  @IsOptional()
  @TransformSortParams()
  @ApiPropertyOptional({
    type: 'string',
    description:
      '?sort=field:DESC|ASC,field2:DESC|ASC - Use to sort lists by passing what field you sort on, and Order type Accepted is DESC and ASC or -1 and 1',
    example: 'id:DESC,price:ASC',
  })
  sort?: SortByDto[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  createdAtFromDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  createdAtToDate?: Date;
}
