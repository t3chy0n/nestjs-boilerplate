import { JobDto } from '../dto/job.dto';

import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { JobCriteria } from '../dto/criteria/job-criteria.dto';
import { CreateJobDto } from '../dto/request/create-job.dto';
import { UpdateJobDto } from '../dto/request/update-job.dto';
import { JobListCriteria } from '../dto/criteria/jobs-list-criteria.dto';
import { DateRangeCriteriaDto } from '@app/job/dto/criteria/date-range-criteria.dto';
import { Job } from '@app/job/entities/job.entity';
import { Profile } from '@app/profile/entities/profile.entity';
import { RankingProfessionDto } from '@app/job/dto/ranking-profession.dto';

export abstract class IJobsService {
  abstract get(criteria: JobCriteria): Promise<JobDto>;

  abstract findMany(
    listCriteria: JobListCriteria,
  ): Promise<PaginatedDataDto<JobDto>>;

  abstract totalJobsPay(criteria: JobListCriteria): Promise<number>;
  abstract getBestClients(
    criteria: DateRangeCriteriaDto,
  ): Promise<PaginatedDataDto<Profile>>;
  abstract getMostPerformingProfession(
    criteria: DateRangeCriteriaDto,
  ): Promise<PaginatedDataDto<RankingProfessionDto>>;

  abstract create(dto: CreateJobDto): Promise<JobDto>;

  abstract update(id: string, dto: UpdateJobDto): Promise<JobDto>;

  abstract delete(id: string): Promise<boolean>;

  abstract payJob(id: string): Promise<JobDto>;
}
