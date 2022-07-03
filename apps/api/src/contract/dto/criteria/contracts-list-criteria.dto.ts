/***
 * Criteria dto for list of contracts, ensures that data cannot be leaked from request body filters, and used for business logic
 */
import { EntityId } from '@libs/types';
import { BaseListCriteriaDto } from '@libs/dto/criteria/base-list-criteria.dto';
import { ContractStatus } from '@app/contract/consts';

export class ContractsListCriteria extends BaseListCriteriaDto {
  ids?: EntityId[];
  description?: string;

  status?: ContractStatus[];

  paymentFromDate?: Date;
  paymentToDate?: Date;

  clientId?: EntityId;

  get paymentDateCriteria(): boolean {
    return !!this.paymentFromDate && !!this.paymentToDate;
  }

  constructor(params: Partial<ContractsListCriteria> = {}) {
    super();
    Object.assign(this, params);
  }
}
