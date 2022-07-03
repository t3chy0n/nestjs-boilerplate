import { AbstractEntityDao } from '@libs/interfaces/dao.interface';
import { ProfileCriteria } from '../dto/criteria/profile-criteria.dto';
import { ProfilesListCriteria } from '../dto/criteria/profile-list-criteria.dto';
import { Profile } from '../entities/profile.entity';

/***
 * Abstraction layer for profile data access object.
 */
export abstract class IProfilesDao extends AbstractEntityDao<
  ProfileCriteria,
  ProfilesListCriteria,
  Profile
> {}
{
}
