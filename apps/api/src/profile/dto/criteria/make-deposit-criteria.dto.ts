import { EntityId } from '@libs/types';

export class MakeDepositCriteriaDto {
  clientId: EntityId;
  amount?: number;

  constructor(params: Partial<MakeDepositCriteriaDto> = {}) {
    Object.assign(this, params);
  }
}
