import { ProfileDto } from '../dto/profile.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { ProfilesListFilterDto } from '../dto/request/profiles-list-filter.dto';
import { CreateProfileDto } from '../dto/request/create-profile.dto';
import { UpdateProfileDto } from '../dto/request/update-profile.dto';
import { EntityId } from '@libs/types';

export abstract class IProfilesController {
  abstract get(id: EntityId): Promise<ProfileDto>;

  abstract findMany(
    filters?: ProfilesListFilterDto,
  ): Promise<PaginatedDataDto<ProfileDto>>;

  abstract create(data: CreateProfileDto): Promise<ProfileDto>;

  abstract update(
    id: string,
    updateData: UpdateProfileDto,
  ): Promise<ProfileDto>;

  abstract delete(id: string): Promise<boolean>;
}
