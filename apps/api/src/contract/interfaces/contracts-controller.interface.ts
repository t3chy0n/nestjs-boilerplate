import { ContractDto } from '../dto/contract.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { ContractsListFilterDto } from '../dto/request/contracts-list-filter.dto';
import { CreateContractDto } from '../dto/request/create-contract.dto';
import { UpdateContractDto } from '../dto/request/update-contract.dto';
import { EntityId } from '@libs/types';
import { SessionHeaderDto } from '@app/contract/dto/session-header.dto';

export abstract class IContractsController {
  abstract get(session: SessionHeaderDto, id: EntityId): Promise<ContractDto>;

  abstract findMany(
    session: SessionHeaderDto,
    filters?: ContractsListFilterDto,
  ): Promise<PaginatedDataDto<ContractDto>>;

  abstract create(data: CreateContractDto): Promise<ContractDto>;

  abstract update(
    id: string,
    updateData: UpdateContractDto,
  ): Promise<ContractDto>;

  abstract delete(id: string): Promise<boolean>;
}
