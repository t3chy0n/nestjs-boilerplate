import { IJobsService } from '../interfaces/jobs-service.interface';
import { JobDto } from '../dto/job.dto';
import { Injectable } from '@nestjs/common';
import { IJobsDao } from '../interfaces/jobs-dao.interface';
import { IJobsMapper } from '../interfaces/jobs-mapper.interface';
import { JobCriteria } from '../dto/criteria/job-criteria.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { CreateJobDto } from '../dto/request/create-job.dto';
import { UpdateJobDto } from '../dto/request/update-job.dto';
import { JobListCriteria } from '@app/job/dto/criteria/jobs-list-criteria.dto';
import { JobWasAlreadyPaidException } from '@app/job/exceptions/job-was-already-paid.exception';
import { IContractsService } from '@app/contract/interfaces/contracts-service.interface';
import { DateRangeCriteriaDto } from '@app/job/dto/criteria/date-range-criteria.dto';
import { Profile } from '@app/profile/entities/profile.entity';
import { RankingProfessionDto } from '@app/job/dto/ranking-profession.dto';

/***
 * Implement entire business logic for jobs
 */
@Injectable()
export class JobsService implements IJobsService {
  constructor(
    private readonly jobsDao: IJobsDao,
    private readonly mapper: IJobsMapper,
    private readonly contractsService: IContractsService,
  ) {}

  async get(criteria: JobCriteria): Promise<JobDto> {
    const result = await this.jobsDao.findOneOrFail(criteria);
    return this.mapper.toDto(result);
  }

  async findMany(
    listCriteria: JobListCriteria,
  ): Promise<PaginatedDataDto<JobDto>> {
    const result = await this.jobsDao.findMany(listCriteria);
    return this.mapper.toPaginatedDto(result);
  }

  async totalJobsPay(criteria: JobListCriteria): Promise<number> {
    return this.jobsDao.totalJobsPay(criteria);
  }

  async create(dto: CreateJobDto): Promise<JobDto> {
    const entity = this.mapper.toEntity(dto);

    if (dto.contractId) {
      entity.contract = await this.contractsService.get({
        id: dto.contractId,
      });
    }

    const result = await this.jobsDao.create(entity);

    return this.mapper.toDto(result);
  }

  async update(id: string, dto: UpdateJobDto): Promise<JobDto> {
    const criteria = new JobCriteria({ id: id });

    await this.jobsDao.findOneOrFail(criteria);
    const entity = this.mapper.toEntity(dto);
    if (dto.contractId) {
      entity.contract = await this.contractsService.get({
        id: dto.contractId,
      });
    }

    const result = await this.jobsDao.update(id, entity);

    return this.mapper.toDto(result);
  }

  async delete(id: string): Promise<boolean> {
    return await this.jobsDao.delete(id);
  }

  async payJob(id: string): Promise<JobDto> {
    const criteria = new JobCriteria({ id: id });
    const job = await this.jobsDao.findOneOrFail(criteria);
    if (job.paid) {
      throw new JobWasAlreadyPaidException().params(job.id);
    }

    const updatedJob = await this.jobsDao.update(id, { paid: true });

    return this.mapper.toDto(updatedJob);
  }

  getBestClients(
    criteria: DateRangeCriteriaDto,
  ): Promise<PaginatedDataDto<Profile>> {
    return this.jobsDao.bestClients(criteria);
  }

  getMostPerformingProfession(
    criteria: DateRangeCriteriaDto,
  ): Promise<PaginatedDataDto<RankingProfessionDto>> {
    return this.jobsDao.mostPerformingProfession(criteria);
  }
}
