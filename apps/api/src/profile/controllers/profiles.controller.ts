import { UpdateProfileDto } from '../dto/request/update-profile.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { ApiPaginatedResponse } from '@libs/utils/swagger/api-paginated-response';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

import { ProfileDto } from '../dto/profile.dto';
import { ProfilesListFilterDto } from '../dto/request/profiles-list-filter.dto';
import { MODULE_TAG } from '../consts';
import { IProfilesController } from '../interfaces/profiles-controller.interface';
import { IProfilesService } from '../interfaces/profiles-service.interface';
import { IProfilesMapper } from '../interfaces/profiles-mapper.interface';
import { ProfileCriteria } from '../dto/criteria/profile-criteria.dto';
import { CreateProfileDto } from '../dto/request/create-profile.dto';
import { EntityId } from '@libs/types';
import { UUID } from '@libs/decorators/uuid.decorator';
import { ProfileNotFoundException } from '../exceptions/profile-not-found.exception';

@ApiTags(MODULE_TAG)
@Controller('profiles')
@ApiException(() => InternalServerErrorException, {
  description: 'Something unexpected happened on server side',
})
export class ProfilesController implements IProfilesController {
  constructor(
    private readonly service: IProfilesService,
    private readonly mapper: IProfilesMapper,
  ) {}

  /***
   * Returns a single profile details by its id
   *
   * @example /profiles/123
   */
  @Get(':id')
  @ApiException(() => ProfileNotFoundException, {
    description: 'Profile was not not found',
  })
  async get(@UUID('id') id: EntityId): Promise<ProfileDto> {
    const criteria = new ProfileCriteria({ id });

    const result = await this.service.get(criteria);
    return this.mapper.toDto(result);
  }

  /***
   * Returns paginated results of profiles
   *
   * @example /profiles?page=1&limit=10&ids=1,2,3
   */
  @Get()
  @ApiPaginatedResponse(ProfileDto)
  async findMany(
    @Query() filters?: ProfilesListFilterDto,
  ): Promise<PaginatedDataDto<ProfileDto>> {
    const criteria = this.mapper.toCriteria(filters);

    const list = await this.service.findMany(criteria);
    return this.mapper.toPaginatedDto(list);
  }

  /***
   * Creates a new profile
   *
   * @param data
   */
  @Post()
  @ApiException(() => BadRequestException, {
    description: 'Invalid data was passed in request body',
  })
  async create(@Body() data: CreateProfileDto): Promise<ProfileDto> {
    const result = await this.service.create(data);
    return this.mapper.toDto(result);
  }

  /***
   * Updates existing profile definition
   *
   * @param id
   * @param updateData
   */
  @Put(':id')
  @ApiException(() => BadRequestException, {
    description: 'Invalid data was passed in request body',
  })
  async update(
    @UUID('id') id: string,
    @Body() updateData: UpdateProfileDto,
  ): Promise<ProfileDto> {
    const result = await this.service.update(id, updateData);
    return this.mapper.toDto(result);
  }

  /***
   * Deletes profile with a given id
   *
   * @param id
   */
  @Delete(':id')
  @ApiException(() => ProfileNotFoundException, {
    description: 'Contract not found',
  })
  async delete(@UUID('id') id: string): Promise<boolean> {
    return await this.service.delete(id);
  }
}
