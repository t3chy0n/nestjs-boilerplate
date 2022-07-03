import { AbstractEntityDao } from '@libs/interfaces/dao.interface';
import { ContractCriteria } from '../dto/criteria/contract-criteria.dto';
import { ContractsListCriteria } from '../dto/criteria/contracts-list-criteria.dto';
import { Contract } from '../entities/contract.entity';

/***
 * Abstraction layer for contract data access object.
 */
export abstract class IContractsDao extends AbstractEntityDao<
  ContractCriteria,
  ContractsListCriteria,
  Contract
> {}
{
}
