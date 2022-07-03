import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { ContractCriteria } from '../dto/criteria/contract-criteria.dto';
import { CreateContractDto } from '../dto/request/create-contract.dto';
import { UpdateContractDto } from '../dto/request/update-contract.dto';
import { ContractsListCriteria } from '../dto/criteria/contracts-list-criteria.dto';
import { Contract } from '@app/contract/entities/contract.entity';
import { SessionHeaderDto } from '@app/contract/dto/session-header.dto';

export abstract class IContractsService {
  abstract get(
    criteria: ContractCriteria,
    session?: SessionHeaderDto,
  ): Promise<Contract>;

  abstract findMany(
    listCriteria: ContractsListCriteria,
    session?: SessionHeaderDto,
  ): Promise<PaginatedDataDto<Contract>>;

  abstract create(dto: CreateContractDto): Promise<Contract>;

  abstract update(id: string, dto: UpdateContractDto): Promise<Contract>;

  abstract delete(id: string): Promise<boolean>;
}
