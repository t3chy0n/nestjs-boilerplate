/***
 * Criteria dto for job, middle layer dto used, for carrying information about resource queries
 */
import { EntityId } from '@libs/types';
import { BaseCriteriaDto } from '@libs/dto/criteria/base-criteria.dto';

export class JobCriteria extends BaseCriteriaDto {
  id?: EntityId;
  description?: string;

  price?: number;

  paid?: boolean;

  paymentFromDate?: Date;
  paymentToDate?: Date;

  constructor(params: Partial<JobCriteria>) {
    super();
    Object.assign(this, params);
  }
}
