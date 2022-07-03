import { EntityId } from '@libs/types';
import { TransformToArray } from '@libs/utils/transformers';
import { Transform } from 'class-transformer';
import { IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { BaseListFilterDto } from '@libs/dto/filters/base-list-filter.dto';

export class JobsListFilterDto extends BaseListFilterDto {
  //
  @IsOptional()
  @Transform(TransformToArray())
  ids?: EntityId[];

  @IsOptional()
  description?: string;

  @IsOptional()
  paid?: boolean;

  @IsOptional()
  @IsISO8601()
  paymentFromDate?: Date;

  @IsOptional()
  @IsISO8601()
  paymentToDate?: Date;

  @IsOptional()
  @IsUUID()
  clientId?: EntityId;

  @IsOptional()
  @IsUUID()
  contractorId?: EntityId;
}
