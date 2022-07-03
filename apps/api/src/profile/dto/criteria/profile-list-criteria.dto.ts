/***
 * Criteria dto for list of profiles, ensures that data cannot be leaked from request body filters, and used for business logic
 */
import { EntityId } from '@libs/types';
import { BaseListCriteriaDto } from '@libs/dto/criteria/base-list-criteria.dto';
import { ProfileType } from '@app/profile/consts';

export class ProfilesListCriteria extends BaseListCriteriaDto {
  ids?: EntityId[];
  type?: ProfileType[];

  constructor(params: Partial<ProfilesListCriteria> = {}) {
    super();
    Object.assign(this, params);
  }
}
