import { EntityId } from '@libs/types';
import { TransformToArray } from '@libs/utils/transformers';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseListFilterDto } from '@libs/dto/filters/base-list-filter.dto';
import { ProfileType } from '../../consts';

export class ProfilesListFilterDto extends BaseListFilterDto {
  @IsOptional()
  @Transform(TransformToArray())
  ids?: EntityId[];

  @IsOptional()
  @Transform(TransformToArray())
  @IsEnum(ProfileType, { each: true })
  type?: ProfileType[];
}
