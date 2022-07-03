import { IProfilesService } from '../interfaces/profiles-service.interface';
import { ProfileDto } from '../dto/profile.dto';
import { Injectable } from '@nestjs/common';
import { IProfilesDao } from '../interfaces/profiles-dao.interface';
import { IProfilesMapper } from '../interfaces/profiles-mapper.interface';
import { ProfileCriteria } from '../dto/criteria/profile-criteria.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { CreateProfileDto } from '../dto/request/create-profile.dto';
import { UpdateProfileDto } from '../dto/request/update-profile.dto';
import { Profile } from '@app/profile/entities/profile.entity';
import { ProfilesListCriteria } from '@app/profile/dto/criteria/profile-list-criteria.dto';

/***
 * Implement entire business logic for profiles
 */
@Injectable()
export class ProfilesService implements IProfilesService {
  constructor(
    private readonly profilesDao: IProfilesDao,
    private readonly mapper: IProfilesMapper,
  ) {}

  async get(criteria: ProfileCriteria): Promise<Profile> {
    const result = await this.profilesDao.findOneOrFail(criteria);
    return result;
  }

  async findMany(
    listCriteria: ProfilesListCriteria,
  ): Promise<PaginatedDataDto<Profile>> {
    return await this.profilesDao.findMany(listCriteria);
  }

  async create(job: CreateProfileDto): Promise<Profile> {
    const entity = this.mapper.toEntity(job);
    return await this.profilesDao.create(entity);
  }

  async update(id: string, toUpdate: UpdateProfileDto): Promise<Profile> {
    const criteria = new ProfileCriteria({ id: id });

    await this.profilesDao.findOneOrFail(criteria);
    const updateEntity = this.mapper.toEntity(toUpdate);
    return await this.profilesDao.update(id, updateEntity);
  }

  async delete(id: string): Promise<boolean> {
    return await this.profilesDao.delete(id);
  }
}
