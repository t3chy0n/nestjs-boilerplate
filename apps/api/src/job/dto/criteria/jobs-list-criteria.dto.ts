/***
 * Criteria dto for list of jobs, ensures that data cannot be leaked from request body filters, and used for business logic
 */
import { EntityId } from '@libs/types';
import { BaseListCriteriaDto } from '@libs/dto/criteria/base-list-criteria.dto';

export class JobListCriteria extends BaseListCriteriaDto {
  ids?: EntityId[];
  description?: string;

  paid?: boolean;

  paymentFromDate?: Date;
  paymentToDate?: Date;

  clientId?: EntityId;
  contractorId?: EntityId;

  get paymentDateCriteria(): boolean {
    return !!this.paymentFromDate && !!this.paymentToDate;
  }

  constructor(params: Partial<JobListCriteria> = {}) {
    super();
    Object.assign(this, params);
  }
}
