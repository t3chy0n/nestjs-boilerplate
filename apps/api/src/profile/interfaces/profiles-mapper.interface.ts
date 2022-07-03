import { ProfilesListCriteria } from '../dto/criteria/profile-list-criteria.dto';
import { ProfileDto } from '../dto/profile.dto';
import { ProfilesListFilterDto } from '../dto/request/profiles-list-filter.dto';
import { Profile } from '../entities/profile.entity';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import {
  ICriteriaMapper,
  IEntityMapper,
  IModelMapper,
} from '@libs/interfaces/model-mapper.interface';
import { CreateProfileDto } from '../dto/request/create-profile.dto';
import { UpdateProfileDto } from '../dto/request/update-profile.dto';
import { EntityId } from '@libs/types';
import { MakeDepositDto } from '@app/profile/dto/request/make-deposit.dto';
import { MakeDepositCriteriaDto } from '@app/profile/dto/criteria/make-deposit-criteria.dto';

export abstract class IProfilesMapper
  implements
    IModelMapper<Profile, ProfileDto>,
    ICriteriaMapper<ProfilesListFilterDto, ProfilesListCriteria>,
    IEntityMapper<CreateProfileDto | UpdateProfileDto, Profile>
{
  abstract toDtos(entities: Profile[]): ProfileDto[];
  abstract toDto(entity: Profile): ProfileDto;
  abstract toPaginatedDto(
    entities: PaginatedDataDto<Profile>,
  ): PaginatedDataDto<ProfileDto>;

  abstract toCriteria(filters: ProfilesListFilterDto): ProfilesListCriteria;
  abstract toMakeDepositCriteria(
    id: EntityId,
    body: MakeDepositDto,
  ): MakeDepositCriteriaDto;
  abstract toEntity(dto: CreateProfileDto | UpdateProfileDto): Partial<Profile>;
}
