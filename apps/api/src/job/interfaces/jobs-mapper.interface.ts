import { JobListCriteria } from '../dto/criteria/jobs-list-criteria.dto';
import { JobDto } from '../dto/job.dto';
import { JobsListFilterDto } from '../dto/request/jobs-list-filter.dto';
import { Job } from '../entities/job.entity';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import {
  ICriteriaMapper,
  IEntityMapper,
  IModelMapper,
  ITypeormCriteriaMapper,
} from '@libs/interfaces/model-mapper.interface';
import { CreateJobDto } from '../dto/request/create-job.dto';
import { UpdateJobDto } from '../dto/request/update-job.dto';
import { EntityId } from '@libs/types';
import { DateRangeFilterDto } from '@app/job/dto/request/date-range-filter.dto';

export abstract class IJobsMapper
  implements
    IModelMapper<Job, JobDto>,
    ICriteriaMapper<JobsListFilterDto, JobListCriteria>,
    ITypeormCriteriaMapper<JobListCriteria>,
    IEntityMapper<CreateJobDto | UpdateJobDto, Job>
{
  abstract toDtos(entities: Job[]): JobDto[];
  abstract toDto(entity: Job): JobDto;
  abstract toPaginatedDto(
    entities: PaginatedDataDto<Job>,
  ): PaginatedDataDto<JobDto>;

  abstract toCriteria(filters: JobsListFilterDto): JobListCriteria;
  abstract toDateRangeCriteria(filter: DateRangeFilterDto);

  abstract toTypeormCriteria(criteria: JobListCriteria): any;
  abstract toEntity(dto: CreateJobDto | UpdateJobDto): Partial<Job>;
}
