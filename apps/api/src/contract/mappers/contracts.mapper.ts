import { DEFAULT_LIMIT, DEFAULT_SKIP } from '@libs/constants/values';
import { ContractsListCriteria } from '../dto/criteria/contracts-list-criteria.dto';
import { ContractDto } from '../dto/contract.dto';
import { ContractsListFilterDto } from '../dto/request/contracts-list-filter.dto';
import { Contract } from '../entities/contract.entity';
import { IContractsMapper } from '../interfaces/contracts-mapper.interface';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { Injectable } from '@nestjs/common';
import { CreateContractDto } from '../dto/request/create-contract.dto';
import { UpdateContractDto } from '../dto/request/update-contract.dto';

/***
 * Mapper handling conversions between dto and entity
 */
@Injectable()
export class ContractsMapper implements IContractsMapper {
  toDto(entity: Contract): ContractDto {
    return new ContractDto({
      id: entity?.id,
      terms: entity.terms,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      clientId: entity.client?.id,
      contractorId: entity.contractor?.id,
    });
  }

  toDtos(entities: Contract[]): ContractDto[] {
    return entities?.map((entity) => this.toDto(entity)) || [];
  }

  toPaginatedDto(
    contracts: PaginatedDataDto<Contract>,
  ): PaginatedDataDto<ContractDto> {
    return new PaginatedDataDto<ContractDto>({
      data: contracts.data.map((entity) => this.toDto(entity)),
      skip: contracts.skip,
      limit: contracts.limit,
      total: contracts.total,
    });
  }

  toCriteria(filters: ContractsListFilterDto = {}): ContractsListCriteria {
    return new ContractsListCriteria({
      skip: filters.skip || DEFAULT_SKIP,
      limit: filters.limit || DEFAULT_LIMIT,
      ids: filters.ids,
      status: filters.status,
      clientId: filters.clientId,
      sort: filters.sort,
    });
  }

  toEntity(dto: CreateContractDto | UpdateContractDto): Partial<Contract> {
    return new Contract({
      terms: dto?.terms,
      status: dto?.status,
    });
  }
}
