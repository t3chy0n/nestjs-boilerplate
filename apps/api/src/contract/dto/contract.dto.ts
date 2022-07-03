import { EntityId } from '@libs/types';
import { ContractStatus } from '@app/contract/consts';

export class ContractDto {
  id: EntityId;

  terms: string;
  status: ContractStatus;

  createdAt: Date;
  updatedAt: Date;

  clientId: EntityId;
  contractorId: EntityId;

  constructor(params: Partial<ContractDto> = {}) {
    Object.assign(this, params);
  }
}
