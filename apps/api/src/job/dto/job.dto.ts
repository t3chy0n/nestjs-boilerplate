import { EntityId } from '@libs/types';

export class JobDto {
  id: EntityId;

  description: string;

  price: number;

  paid: boolean;

  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;

  contractId: EntityId;

  constructor(params: Partial<JobDto> = {}) {
    Object.assign(this, params);
  }
}
