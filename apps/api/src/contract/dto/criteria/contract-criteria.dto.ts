/***
 * Criteria dto for contract, middle layer dto used, for carrying information about resource queries
 */
import { EntityId } from '@libs/types';
import { BaseCriteriaDto } from '@libs/dto/criteria/base-criteria.dto';

export class ContractCriteria extends BaseCriteriaDto {
  id?: EntityId;
  description?: string;

  price?: number;

  paid?: boolean;

  paymentDate?: Date;

  clientId?: EntityId;

  constructor(params: Partial<ContractCriteria>) {
    super();
    Object.assign(this, params);
  }
}
