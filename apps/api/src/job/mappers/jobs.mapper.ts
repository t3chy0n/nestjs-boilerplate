import * as _ from 'lodash';

import { DEFAULT_LIMIT, DEFAULT_SKIP } from '@libs/constants/values';
import { JobListCriteria } from '../dto/criteria/jobs-list-criteria.dto';
import { JobDto } from '../dto/job.dto';
import { JobsListFilterDto } from '../dto/request/jobs-list-filter.dto';
import { Job } from '../entities/job.entity';
import { IJobsMapper } from '../interfaces/jobs-mapper.interface';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { Injectable } from '@nestjs/common';
import { CreateJobDto } from '../dto/request/create-job.dto';
import { UpdateJobDto } from '../dto/request/update-job.dto';
import { Between, ILike, In } from 'typeorm';
import { EntityId } from '@libs/types';
import { DateRangeFilterDto } from '@app/job/dto/request/date-range-filter.dto';
import { DateRangeCriteriaDto } from '@app/job/dto/criteria/date-range-criteria.dto';

const DEFAULT_LIMIT_ON_ADMIN_REQUEST = 2;

/***
 * Mapper handling conversions between dto and entity
 */
@Injectable()
export class JobsMapper implements IJobsMapper {
  toDto(entity: Job): JobDto {
    return new JobDto({
      id: entity?.id,
      description: entity.description,
      paid: entity.paid,
      paymentDate: entity.paymentDate,
      price: entity.price,
      contractId: entity.contract?.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toDateRangeCriteria(filter: DateRangeFilterDto): DateRangeCriteriaDto {
    return new DateRangeCriteriaDto({
      start: filter.start,
      end: filter.end,
      skip: filter.skip ?? DEFAULT_SKIP,
      limit: filter.limit,
    });
  }

  toDtos(entities: Job[]): JobDto[] {
    return entities?.map((entity) => this.toDto(entity)) || [];
  }

  toPaginatedDto(dto: PaginatedDataDto<Job>): PaginatedDataDto<JobDto> {
    return new PaginatedDataDto<JobDto>({
      data: dto.data.map((entity) => this.toDto(entity)),
      skip: dto.skip,
      limit: dto.limit,
      total: dto.total,
    });
  }

  toCriteria(filters: JobsListFilterDto = {}): JobListCriteria {
    return new JobListCriteria({
      skip: filters.skip || DEFAULT_SKIP,
      limit: filters.limit || DEFAULT_LIMIT,
      ids: filters.ids,
      paid: filters.paid,
      description: filters.description,
      paymentFromDate: filters.paymentFromDate,
      paymentToDate: filters.paymentToDate,
      sort: filters.sort,
      clientId: filters.clientId,
      contractorId: filters.contractorId,
    });
  }

  toEntity(dto: CreateJobDto | UpdateJobDto): Partial<Job> {
    return new Job({
      description: dto?.description,
      price: dto?.price,
    });
  }

  toTypeormCriteria(criteria: JobListCriteria): any {
    const {
      ids,
      description,
      paymentFromDate,
      paymentToDate,
      createdAtFromDate,
      createdAtToDate,
      updatedAtFromDate,
      updatedAtToDate,
      clientId,
      contractorId,
      paid,
    } = criteria;

    const profileFilters = _.merge(
      {},
      clientId && { contract: { client: { id: clientId } } },
      contractorId && { contract: { contractor: { id: contractorId } } },
    );

    return {
      ...(ids && { id: In(ids) }),
      ...(description && { name: ILike(`%${description}%`) }),
      ...(paid !== undefined && { paid }),
      ...(criteria.createdAtCriteria && {
        createdAt: Between(createdAtFromDate, createdAtToDate),
      }),
      ...(criteria.updatedAtAtCriteria && {
        updatedAt: Between(updatedAtFromDate, updatedAtToDate),
      }),
      ...(criteria.paymentDateCriteria && {
        paymentDate: Between(paymentFromDate, paymentToDate),
      }),
      ...profileFilters,
    };
  }
}
