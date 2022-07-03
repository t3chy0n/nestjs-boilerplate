import { DEFAULT_LIMIT, DEFAULT_SKIP } from '@libs/constants/values';
import { ProfilesListCriteria } from '../dto/criteria/profile-list-criteria.dto';
import { ProfileDto } from '../dto/profile.dto';
import { ProfilesListFilterDto } from '../dto/request/profiles-list-filter.dto';
import { Profile } from '../entities/profile.entity';
import { IProfilesMapper } from '../interfaces/profiles-mapper.interface';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from '../dto/request/create-profile.dto';
import { UpdateProfileDto } from '../dto/request/update-profile.dto';
import { EntityId } from '@libs/types';
import { MakeDepositDto } from '@app/profile/dto/request/make-deposit.dto';
import { MakeDepositCriteriaDto } from '@app/profile/dto/criteria/make-deposit-criteria.dto';

/***
 * Mapper handling conversions between dto and entity
 */
@Injectable()
export class ProfilesMapper implements IProfilesMapper {
  toDto(entity: Profile): ProfileDto {
    return new ProfileDto({
      id: entity?.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      balance: parseFloat(entity.balance.toString()),
      profession: entity.profession,
      type: entity.type,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toDtos(entities: Profile[]): ProfileDto[] {
    return entities?.map((entity) => this.toDto(entity)) || [];
  }

  toPaginatedDto(
    contracts: PaginatedDataDto<Profile>,
  ): PaginatedDataDto<ProfileDto> {
    return new PaginatedDataDto<ProfileDto>({
      data: contracts.data.map((entity) => this.toDto(entity)),
      skip: contracts.skip,
      limit: contracts.limit,
      total: contracts.total,
    });
  }

  toCriteria(filters: ProfilesListFilterDto = {}): ProfilesListCriteria {
    return new ProfilesListCriteria({
      skip: filters.skip || DEFAULT_SKIP,
      limit: filters.limit || DEFAULT_LIMIT,
      ids: filters.ids,
      type: filters.type,

      sort: filters.sort,
    });
  }

  toMakeDepositCriteria(
    id: EntityId,
    body: MakeDepositDto,
  ): MakeDepositCriteriaDto {
    return new MakeDepositCriteriaDto({
      clientId: id,
      amount: body.amount,
    });
  }

  toEntity(dto: CreateProfileDto | UpdateProfileDto): Partial<Profile> {
    return new Profile({
      firstName: dto?.firstName,
      lastName: dto?.lastName,
      balance: dto?.balance,
      profession: dto?.profession,
      type: dto?.type,
    });
  }
}
