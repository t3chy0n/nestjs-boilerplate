export const MODULE_TAG = 'Contracts';

export const Messages = {
  ERROR_NOT_FOUND: `contract.ERROR_NOT_FOUND`,
  ERROR_INVALID_CONTRACT_LIST: `contract.ERROR_INVALID_CONTRACT_LIST`,
};

export enum ContractStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  TERMINATED = 'terminated',
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}
