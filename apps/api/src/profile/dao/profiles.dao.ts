import { ProfileCriteria } from '../dto/criteria/profile-criteria.dto';
import { ProfilesListCriteria } from '../dto/criteria/profile-list-criteria.dto';
import { Profile } from '../entities/profile.entity';
import { ProfileNotFoundException } from '../exceptions/profile-not-found.exception';
import { IProfilesDao } from '../interfaces/profiles-dao.interface';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { BaseDao } from '@libs/dao/base.dao';
import { EntityId } from '@libs/types';
import { omitEmpty } from '@libs/utils/transformers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';

/***
 * Profiles data access object. Abstraction layer to data. This implementation is using Typeorm to manage data
 */
@Injectable()
export class ProfilesDao extends BaseDao implements IProfilesDao {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {
    super();
  }

  async create(entity: Partial<Profile>): Promise<Profile> {
    return await this.profileRepository.save(entity);
  }

  async delete(id: EntityId): Promise<boolean> {
    const criteria = new ProfileCriteria({ id });
    const resource = await this.findOneOrFail(criteria);

    const result = await this.profileRepository.remove(resource);
    return !!result;
  }

  async findMany(
    criteria: ProfilesListCriteria,
  ): Promise<PaginatedDataDto<Profile>> {
    const {
      sort,
      ids,
      skip,
      limit,
      type,
      createdAtFromDate,
      createdAtToDate,
      updatedAtFromDate,
      updatedAtToDate,
    } = criteria;

    const [data, total] = await this.profileRepository.findAndCount({
      skip,
      take: limit,
      order: this.toSortOptions(sort),
      where: {
        ...(ids && { id: In(ids) }),
        ...(type && { type: In(type) }),

        ...(criteria.createdAtCriteria && {
          createdAt: Between(createdAtFromDate, createdAtToDate),
        }),
        ...(criteria.updatedAtAtCriteria && {
          updatedAt: Between(updatedAtFromDate, updatedAtToDate),
        }),
      },
    });

    return new PaginatedDataDto({
      total,
      data,
      skip,
      limit,
    });
  }

  async findOne(criteria: ProfileCriteria): Promise<Profile> {
    const { id } = criteria;
    return await this.profileRepository.findOne({
      where: {
        ...(id && { id }),
      },
    });
  }

  async findOneOrFail(criteria: ProfileCriteria): Promise<Profile> {
    const result = await this.findOne(criteria);

    if (!result) {
      throw new ProfileNotFoundException().params(criteria.id);
    }

    return result;
  }

  async update(id: EntityId, entity: Partial<Profile>): Promise<Profile> {
    const criteria = new ProfileCriteria({ id });

    const resource = await this.findOneOrFail(criteria);

    return await this.profileRepository.save({
      ...omitEmpty(resource),
      ...omitEmpty(entity),
    });
  }
}
