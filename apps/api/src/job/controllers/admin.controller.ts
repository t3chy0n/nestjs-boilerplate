import { EntityId } from '@libs/types';
import { ProfileDto } from '@app/profile/dto/profile.dto';
import { ApiTags } from '@nestjs/swagger';
import { ADMIN_MODULE_TAG } from '@app/profile/consts';
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
} from '@nestjs/common';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { UUID } from '@libs/decorators/uuid.decorator';
import { DateRangeFilterDto } from '@app/job/dto/request/date-range-filter.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { IJobsMapper } from '@app/job/interfaces/jobs-mapper.interface';
import { IJobsService } from '@app/job/interfaces/jobs-service.interface';
import { IAdminController } from '@app/job/interfaces/admin-controller.interface';
import { JobDto } from '@app/job/dto/job.dto';
import { IProfilesMapper } from '@app/profile/interfaces/profiles-mapper.interface';
import { RankingProfessionDto } from '@app/job/dto/ranking-profession.dto';

@ApiTags(ADMIN_MODULE_TAG)
@Controller('admin')
@ApiException(() => InternalServerErrorException, {
  description: 'Something unexpected happened on server side',
})
export class AdminController implements IAdminController {
  constructor(
    private readonly service: IJobsService,
    private readonly mapper: IJobsMapper,
    private readonly profileMapper: IProfilesMapper,
  ) {}

  /***
   * Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
   *
   */
  @Get('/best-profession')
  async bestProfession(
    @Query() dto: DateRangeFilterDto,
  ): Promise<PaginatedDataDto<RankingProfessionDto>> {
    const criteria = this.mapper.toDateRangeCriteria(dto);
    return await this.service.getMostPerformingProfession(criteria);
  }

  /***
   * Returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
   */
  @Get('/best-clients')
  async bestClients(
    @Query() dto: DateRangeFilterDto,
  ): Promise<PaginatedDataDto<ProfileDto>> {
    const criteria = this.mapper.toDateRangeCriteria(dto);
    const result = await this.service.getBestClients(criteria);
    return this.profileMapper.toPaginatedDto(result);
  }
}
