import { AbstractEntityDao } from '@libs/interfaces/dao.interface';
import { JobCriteria } from '@app/job/dto/criteria/job-criteria.dto';
import { JobListCriteria } from '@app/job/dto/criteria/jobs-list-criteria.dto';
import { Job } from '@app/job/entities/job.entity';
import { DateRangeCriteriaDto } from '@app/job/dto/criteria/date-range-criteria.dto';
import { Profile } from '@app/profile/entities/profile.entity';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { RankingProfessionDto } from '@app/job/dto/ranking-profession.dto';

/***
 * Abstraction layer for job data access object.
 */
export abstract class IJobsDao extends AbstractEntityDao<
  JobCriteria,
  JobListCriteria,
  Job
> {
  abstract totalJobsPay(criteria: JobListCriteria): Promise<number>;
  abstract bestClients(
    criteria: DateRangeCriteriaDto,
  ): Promise<PaginatedDataDto<Profile>>;
  abstract mostPerformingProfession(
    criteria: DateRangeCriteriaDto,
  ): Promise<PaginatedDataDto<RankingProfessionDto>>;
}
