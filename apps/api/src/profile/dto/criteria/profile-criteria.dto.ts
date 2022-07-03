/***
 * Criteria dto for contract, middle layer dto used, for carrying information about resource queries
 */
import { EntityId } from '@libs/types';
import { BaseCriteriaDto } from '@libs/dto/criteria/base-criteria.dto';

export class ProfileCriteria extends BaseCriteriaDto {
  id?: EntityId;
  description?: string;

  price?: number;

  paid?: boolean;

  paymentDate?: Date;

  constructor(params: Partial<ProfileCriteria>) {
    super();
    Object.assign(this, params);
  }
}
