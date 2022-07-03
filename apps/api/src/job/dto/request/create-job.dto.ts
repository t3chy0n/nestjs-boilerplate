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

export class CreateJobDto {
  @IsOptional({
    groups: [HttpMethods.PUT],
  })
  @IsString()
  description: string;

  @IsOptional({
    groups: [HttpMethods.PUT],
  })
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsUUID()
  contractId?: EntityId;

  constructor(params: Partial<CreateJobDto> = {}) {
    Object.assign(this, params);
  }
}
