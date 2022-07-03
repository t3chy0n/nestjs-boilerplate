import { UpdateJobDto } from '../dto/request/update-job.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { ApiPaginatedResponse } from '@libs/utils/swagger/api-paginated-response';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Optional,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

import { JobDto } from '../dto/job.dto';
import { JobsListFilterDto } from '../dto/request/jobs-list-filter.dto';
import { MODULE_TAG } from '../consts';
import { IJobsController } from '../interfaces/jobs-controller.interface';
import { IJobsService } from '../interfaces/jobs-service.interface';
import { IJobsMapper } from '../interfaces/jobs-mapper.interface';
import { JobCriteria } from '../dto/criteria/job-criteria.dto';
import { CreateJobDto } from '../dto/request/create-job.dto';
import { EntityId } from '@libs/types';
import { UUID } from '@libs/decorators/uuid.decorator';
import { JobNotFoundException } from '../exceptions/job-not-found.exception';
import { JobWasAlreadyPaidException } from '@app/job/exceptions/job-was-already-paid.exception';
import { ContractNotFoundException } from '@app/contract/exceptions/contract-not-found.exception';

@ApiTags(MODULE_TAG)
@Controller('jobs')
@ApiException(() => InternalServerErrorException, {
  description: 'Something unexpected happened on server side',
})
export class JobsController implements IJobsController {
  constructor(
    private readonly jobsService: IJobsService,
    private readonly mapper: IJobsMapper,
  ) {}

  /***
   * Returns paginated of all unpaid jobs
   *
   * @example /jobs/unpaid?page=1&limit=10&ids=1,2,3
   */
  @Get('unpaid')
  @ApiPaginatedResponse(JobDto)
  async findUnpaidJobs(
    @Query() filters?: JobsListFilterDto,
  ): Promise<PaginatedDataDto<JobDto>> {
    const criteria = this.mapper.toCriteria({ ...filters, paid: false });

    return this.jobsService.findMany(criteria);
  }

  /***
   * Returns a single job details by its id
   *
   * @example /job/123
   */
  @Get(':id')
  @ApiException(() => JobNotFoundException, {
    description: 'Job was not not found',
  })
  async get(@UUID('id') id: EntityId): Promise<JobDto> {
    const criteria = new JobCriteria({ id });

    return this.jobsService.get(criteria);
  }

  /***
   * Returns paginated results of jobs
   *
   * @example /jobs?page=1&limit=10&ids=1,2,3
   */
  @Get()
  @ApiPaginatedResponse(JobDto)
  async findMany(
    @Query() filters?: JobsListFilterDto,
  ): Promise<PaginatedDataDto<JobDto>> {
    const criteria = this.mapper.toCriteria(filters);

    return this.jobsService.findMany(criteria);
  }

  /***
   * Creates a new job
   *
   * @param dto
   */
  @Post()
  @ApiException(() => BadRequestException, {
    description: 'Invalid data was passed in request body',
  })
  @ApiException(() => ContractNotFoundException, {
    description: 'Contract was not not found',
  })
  async create(@Body() dto: CreateJobDto): Promise<JobDto> {
    return this.jobsService.create(dto);
  }

  /***
   * Updates existing job definition
   *
   * @param id
   * @param dto
   */
  @Put(':id')
  @ApiException(() => BadRequestException, {
    description: 'Invalid data was passed in request body',
  })
  @ApiException(() => ContractNotFoundException, {
    description: 'Contract was not not found',
  })
  async update(
    @UUID('id') id: string,
    @Body() dto: UpdateJobDto,
  ): Promise<JobDto> {
    return await this.jobsService.update(id, dto);
  }

  /***
   * Pays pending amount for a job
   *
   * @param id
   */
  @Put(':id/pay')
  @ApiException(() => JobWasAlreadyPaidException, {
    description: 'When job was already paid',
  })
  async payJob(@UUID('id') id: string): Promise<JobDto> {
    return await this.jobsService.payJob(id);
  }

  /***
   * Deletes job of a given id
   *
   * @param id
   */
  @Delete(':id')
  @ApiException(() => JobNotFoundException, {
    description: 'Job not found',
  })
  async delete(@UUID('id') id: string): Promise<boolean> {
    return await this.jobsService.delete(id);
  }
}
