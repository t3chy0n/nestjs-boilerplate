import { Extensions1649348055090 } from './migrations/1649348055090-Extensions';
import { GenerateTablesForDataModel1656777149978 } from '@db/migrations/1656777149978-generate-tables-for-data-model';
import { UpdateContractsRelation1656791045333 } from '@db/migrations/1656791045333-update-contracts-relation';
import { JobCascadeDelete1656791994250 } from '@db/migrations/1656791994250-job-cascade-delete';
import { ContractCascadeDelete1656829560195 } from '@db/migrations/1656829560195-contract-cascade-delete';
import { JobPaymentDateNullable1656834406352 } from '@db/migrations/1656834406352-job-payment-date-nullable';

export const MigrationsProvider = [
  Extensions1649348055090,
  GenerateTablesForDataModel1656777149978,
  UpdateContractsRelation1656791045333,
  JobCascadeDelete1656791994250,
  ContractCascadeDelete1656829560195,
  JobPaymentDateNullable1656834406352,
];
