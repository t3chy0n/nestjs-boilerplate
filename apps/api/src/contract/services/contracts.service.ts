import { IContractsService } from '../interfaces/contracts-service.interface';
import { ContractDto } from '../dto/contract.dto';
import { Injectable } from '@nestjs/common';
import { IContractsDao } from '../interfaces/contracts-dao.interface';
import { IContractsMapper } from '../interfaces/contracts-mapper.interface';
import { ContractCriteria } from '../dto/criteria/contract-criteria.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { CreateContractDto } from '../dto/request/create-contract.dto';
import { UpdateContractDto } from '../dto/request/update-contract.dto';
import { ContractsListCriteria } from '@app/contract/dto/criteria/contracts-list-criteria.dto';
import { IProfilesService } from '@app/profile/interfaces/profiles-service.interface';
import { Contract } from '@app/contract/entities/contract.entity';
import { SessionHeaderDto } from '@app/contract/dto/session-header.dto';
import { Role } from '@app/contract/consts';

/***
 * Implement entire business logic for contracts
 */
@Injectable()
export class ContractsService implements IContractsService {
  constructor(
    private readonly contractsDao: IContractsDao,
    private readonly mapper: IContractsMapper,
    private readonly profileService: IProfilesService,
  ) {}

  async get(
    criteria: ContractCriteria,
    session?: SessionHeaderDto,
  ): Promise<Contract> {
    if (session && Role.ADMIN !== session?.role) {
      criteria.clientId = session.profile_id;
    }
    return await this.contractsDao.findOneOrFail(criteria);
  }

  async findMany(
    listCriteria: ContractsListCriteria,
    session?: SessionHeaderDto,
  ): Promise<PaginatedDataDto<Contract>> {
    if (session && Role.ADMIN !== session?.role) {
      listCriteria.clientId = session.profile_id;
    }
    return await this.contractsDao.findMany(listCriteria);
  }

  async create(dto: CreateContractDto): Promise<Contract> {
    const entity = this.mapper.toEntity(dto);
    entity.client = await this.profileService.get({ id: dto.clientId });

    if (dto.contractorId) {
      entity.contractor = await this.profileService.get({
        id: dto.contractorId,
      });
    }

    return await this.contractsDao.create(entity);
  }

  async update(id: string, dto: UpdateContractDto): Promise<Contract> {
    const criteria = new ContractCriteria({ id: id });
    const entity = this.mapper.toEntity(dto);

    await this.contractsDao.findOneOrFail(criteria);

    if (dto.clientId) {
      entity.client = await this.profileService.get({
        id: dto.clientId,
      });
    }

    if (dto.contractorId) {
      entity.contractor = await this.profileService.get({
        id: dto.contractorId,
      });
    }
    return await this.contractsDao.update(id, entity);
  }

  async delete(id: string): Promise<boolean> {
    return await this.contractsDao.delete(id);
  }
}
