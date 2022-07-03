import { JobDto } from '../dto/job.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { JobsListFilterDto } from '../dto/request/jobs-list-filter.dto';
import { CreateJobDto } from '../dto/request/create-job.dto';
import { UpdateJobDto } from '../dto/request/update-job.dto';
import { EntityId } from '@libs/types';

export abstract class IJobsController {
  abstract get(id: EntityId): Promise<JobDto>;

  abstract findMany(
    filters?: JobsListFilterDto,
  ): Promise<PaginatedDataDto<JobDto>>;

  abstract create(dto: CreateJobDto): Promise<JobDto>;

  abstract update(id: string, dto: UpdateJobDto): Promise<JobDto>;

  abstract delete(id: string): Promise<boolean>;

  abstract payJob(id: string): Promise<JobDto>;
}
