import { EntityId } from '@libs/types';
import { TransformToArray } from '@libs/utils/transformers';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { BaseListFilterDto } from '@libs/dto/filters/base-list-filter.dto';
import { ContractStatus } from '@app/contract/consts';

export class ContractsListFilterDto extends BaseListFilterDto {
  @IsOptional()
  @Transform(TransformToArray())
  ids?: EntityId[];

  @IsOptional()
  @IsUUID()
  clientId?: EntityId;

  @IsOptional()
  @IsArray()
  @IsEnum(ContractStatus, { each: true })
  @Transform(TransformToArray({ type: ContractStatus }))
  status?: ContractStatus[];
}
