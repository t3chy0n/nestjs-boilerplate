import { IsNumber, IsUUID, Min } from 'class-validator';
import { EntityId } from '@libs/types';

export class MakeDepositDto {
  @IsNumber()
  @Min(0.1)
  amount: number;

  constructor(params: Partial<MakeDepositDto> = {}) {
    Object.assign(this, params);
  }
}
