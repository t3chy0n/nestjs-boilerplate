import { JobCriteria } from '../dto/criteria/job-criteria.dto';
import { JobListCriteria } from '../dto/criteria/jobs-list-criteria.dto';
import { Job } from '../entities/job.entity';
import { JobNotFoundException } from '../exceptions/job-not-found.exception';
import { IJobsDao } from '../interfaces/jobs-dao.interface';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { BaseDao } from '@libs/dao/base.dao';
import { EntityId } from '@libs/types';
import { omitEmpty } from '@libs/utils/transformers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IJobsMapper } from '@app/job/interfaces/jobs-mapper.interface';
import { DateRangeCriteriaDto } from '@app/job/dto/criteria/date-range-criteria.dto';
import { Profile } from '@app/profile/entities/profile.entity';
import { RankingProfessionDto } from '@app/job/dto/ranking-profession.dto';

/***
 * Jobs data access object. Abstraction layer to data. This implementation is using Typeorm to manage data
 */
@Injectable()
export class JobsDao extends BaseDao implements IJobsDao {
  constructor(
    private readonly mapper: IJobsMapper,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {
    super();
  }

  async create(entity: Partial<Job>): Promise<Job> {
    return await this.jobRepository.save(entity);
  }

  async delete(id: EntityId): Promise<boolean> {
    const criteria = new JobCriteria({ id });
    const resource = await this.findOneOrFail(criteria);

    const result = await this.jobRepository.remove(resource);
    return !!result;
  }

  async findMany(criteria: JobListCriteria): Promise<PaginatedDataDto<Job>> {
    const { skip, limit, sort } = criteria;
    const where = this.mapper.toTypeormCriteria(criteria);

    const [data, total] = await this.jobRepository.findAndCount({
      skip,
      take: limit,
      order: this.toSortOptions(sort),
      where,
      relations: ['contract', 'contract.client', 'contract.contractor'],
    });

    return new PaginatedDataDto({
      total,
      data,
      skip,
      limit,
    });
  }

  async totalJobsPay(criteria: JobListCriteria): Promise<number> {
    const qb = this.jobRepository.createQueryBuilder('job');
    const result = await qb
      .select(`SUM(DISTINCT job.price) as "sum" `)
      .innerJoin('contract', 'contract', 'contract.id = job.contractId')
      .innerJoin('profile', 'client', 'client.id = contract.clientId')
      .where('client.id = :id', { id: criteria.clientId })
      .getRawOne();
    return parseFloat(result.sum);
  }

  async bestClients(
    criteria: DateRangeCriteriaDto,
  ): Promise<PaginatedDataDto<Profile>> {
    const qb = this.jobRepository.createQueryBuilder('job');
    const result = await qb
      .select(
        `SUM(DISTINCT job.price) as "balance", client.id, client.firstName, client.lastName, client.profession, client.type`,
      )
      .innerJoin('contract', 'contract', 'contract.id = job.contractId')
      .innerJoin('profile', 'client', 'client.id = contract.clientId')
      .groupBy('client.id')
      .orderBy('balance', 'DESC')
      .limit(criteria.limit ?? 2)
      .where('paid = :paid', { paid: true })
      .andWhere('job.paymentDate > :start', { start: criteria.start })
      .andWhere('job.paymentDate < :end', { end: criteria.end })
      .getRawMany();

    const data = result.map((r) => new Profile(r));
    const paginated = new PaginatedDataDto<Profile>();
    paginated.data = data;
    return paginated;
  }

  async mostPerformingProfession(
    criteria: DateRangeCriteriaDto,
  ): Promise<PaginatedDataDto<RankingProfessionDto>> {
    const qb = this.jobRepository.createQueryBuilder('job');

    const result = await qb
      .select(`SUM(DISTINCT job.price) as "profit", contractor.profession`)
      .innerJoin('contract', 'contract', 'contract.id = job.contractId')
      .innerJoin('profile', 'client', 'client.id = contract.clientId')
      .innerJoin(
        'profile',
        'contractor',
        'contractor.id = contract.contractorId',
      )
      .groupBy('contractor.profession')
      .orderBy('profit', 'DESC')
      .limit(criteria.limit ?? 1)
      .where('paid = :paid', { paid: true })
      .andWhere('job.paymentDate > :start', { start: criteria.start })
      .andWhere('job.paymentDate < :end', { end: criteria.end })
      .getRawMany();
    const data = result.map((r) => new RankingProfessionDto(r));
    const paginated = new PaginatedDataDto<RankingProfessionDto>();
    paginated.data = data;
    return paginated;
  }

  async findOne(criteria: JobCriteria): Promise<Job> {
    const { id } = criteria;
    return await this.jobRepository.findOne({
      where: {
        ...(id && { id }),
      },
      relations: ['contract'],
    });
  }

  async findOneOrFail(criteria: JobCriteria): Promise<Job> {
    const job = await this.findOne(criteria);

    if (!job) {
      throw new JobNotFoundException().params(criteria.id);
    }

    return job;
  }

  async update(id: EntityId, entity: Partial<Job>): Promise<Job> {
    const criteria = new JobCriteria({ id });

    const resource = await this.findOneOrFail(criteria);

    return await this.jobRepository.save({
      ...omitEmpty(resource),
      ...omitEmpty(entity),
    });
  }
}
