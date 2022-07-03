import { ContractsListCriteria } from '../dto/criteria/contracts-list-criteria.dto';
import { ContractDto } from '../dto/contract.dto';
import { ContractsListFilterDto } from '../dto/request/contracts-list-filter.dto';
import { Contract } from '../entities/contract.entity';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import {
  ICriteriaMapper,
  IEntityMapper,
  IModelMapper,
} from '@libs/interfaces/model-mapper.interface';
import { CreateContractDto } from '../dto/request/create-contract.dto';
import { UpdateContractDto } from '../dto/request/update-contract.dto';

export abstract class IContractsMapper
  implements
    IModelMapper<Contract, ContractDto>,
    ICriteriaMapper<ContractsListFilterDto, ContractsListCriteria>,
    IEntityMapper<CreateContractDto | UpdateContractDto, Contract>
{
  abstract toDtos(entities: Contract[]): ContractDto[];
  abstract toDto(entity: Contract): ContractDto;
  abstract toPaginatedDto(
    entities: PaginatedDataDto<Contract>,
  ): PaginatedDataDto<ContractDto>;

  abstract toCriteria(filters: ContractsListFilterDto): ContractsListCriteria;
  abstract toEntity(
    dto: CreateContractDto | UpdateContractDto,
  ): Partial<Contract>;
}
