import {
  IsBoolean,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { HttpMethods } from '@libs/enums/http-methods.enum';
import { EntityId } from '@libs/types';
import { BaseListFilterDto } from '@libs/dto/filters/base-list-filter.dto';

export class DateRangeFilterDto extends BaseListFilterDto {
  @IsOptional()
  @IsISO8601()
  start: Date;

  @IsOptional()
  @IsISO8601()
  end: Date;

  constructor(params: Partial<DateRangeFilterDto> = {}) {
    super();
    Object.assign(this, params);
  }
}
