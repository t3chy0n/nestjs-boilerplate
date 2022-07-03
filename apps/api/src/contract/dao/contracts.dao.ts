import { ContractCriteria } from '../dto/criteria/contract-criteria.dto';
import { ContractsListCriteria } from '../dto/criteria/contracts-list-criteria.dto';
import { Contract } from '../entities/contract.entity';
import { ContractNotFoundException } from '../exceptions/contract-not-found.exception';
import { IContractsDao } from '../interfaces/contracts-dao.interface';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { BaseDao } from '@libs/dao/base.dao';
import { EntityId } from '@libs/types';
import { omitEmpty } from '@libs/utils/transformers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, In, Repository } from 'typeorm';

/***
 * Jobs data access object. Abstraction layer to data. This implementation is using Typeorm to manage data
 */
@Injectable()
export class ContractsDao extends BaseDao implements IContractsDao {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {
    super();
  }

  async create(entity: Partial<Contract>): Promise<Contract> {
    return await this.contractRepository.save(entity);
  }

  async delete(id: EntityId): Promise<boolean> {
    const criteria = new ContractCriteria({ id });
    const resource = await this.findOneOrFail(criteria);

    const result = await this.contractRepository.remove(resource);
    return !!result;
  }

  async findMany(
    criteria: ContractsListCriteria,
  ): Promise<PaginatedDataDto<Contract>> {
    const {
      sort,
      ids,
      skip,
      limit,
      clientId,
      status,
      description,
      createdAtFromDate,
      createdAtToDate,
      updatedAtFromDate,
      updatedAtToDate,
    } = criteria;

    const [data, total] = await this.contractRepository.findAndCount({
      skip,
      take: limit,
      order: this.toSortOptions(sort),
      where: {
        ...(ids && { id: In(ids) }),
        ...(status && { status: In(status) }),
        ...(description && { name: ILike(`%${description}%`) }),
        ...(clientId && { client: { id: clientId } }),
        ...(criteria.createdAtCriteria && {
          createdAt: Between(createdAtFromDate, createdAtToDate),
        }),
        ...(criteria.updatedAtAtCriteria && {
          updatedAt: Between(updatedAtFromDate, updatedAtToDate),
        }),
      },
      relations: ['client', 'contractor', 'jobs'],
    });

    return new PaginatedDataDto({
      total,
      data,
      skip,
      limit,
    });
  }

  async findOne(criteria: ContractCriteria): Promise<Contract> {
    const { id, clientId } = criteria;
    return await this.contractRepository.findOne({
      where: {
        ...(id && { id }),
        ...(clientId && { client: { id: clientId } }),
      },
      relations: ['client', 'contractor', 'jobs'],
    });
  }

  async findOneOrFail(criteria: ContractCriteria): Promise<Contract> {
    const contract = await this.findOne(criteria);

    if (!contract) {
      throw new ContractNotFoundException().params(criteria.id);
    }

    return contract;
  }

  async update(id: EntityId, entity: Partial<Contract>): Promise<Contract> {
    const criteria = new ContractCriteria({ id });

    const resource = await this.findOneOrFail(criteria);

    return await this.contractRepository.save({
      ...omitEmpty(resource),
      ...omitEmpty(entity),
    });
  }
}
