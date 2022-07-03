import { ProfileDto } from '../dto/profile.dto';

import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { ProfileCriteria } from '../dto/criteria/profile-criteria.dto';
import { CreateProfileDto } from '../dto/request/create-profile.dto';
import { UpdateProfileDto } from '../dto/request/update-profile.dto';
import { ProfilesListCriteria } from '../dto/criteria/profile-list-criteria.dto';
import { Profile } from '@app/profile/entities/profile.entity';

export abstract class IProfilesService {
  abstract get(criteria: ProfileCriteria): Promise<Profile>;

  abstract findMany(
    listCriteria: ProfilesListCriteria,
  ): Promise<PaginatedDataDto<Profile>>;

  abstract create(job: CreateProfileDto): Promise<Profile>;

  abstract update(id: string, toUpdate: UpdateProfileDto): Promise<Profile>;

  abstract delete(id: string): Promise<boolean>;
}
