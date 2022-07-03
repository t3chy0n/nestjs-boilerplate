import { IsOptional, IsString, IsUUID } from 'class-validator';
import { HttpMethods } from '@libs/enums/http-methods.enum';
import { ContractStatus } from '@app/contract/consts';
import { EntityId } from '@libs/types';

export class CreateContractDto {
  @IsOptional({
    groups: [HttpMethods.PUT],
  })
  @IsString()
  terms: string;

  @IsOptional({
    groups: [HttpMethods.PUT],
  })
  @IsString()
  status: ContractStatus;

  @IsOptional({
    groups: [HttpMethods.PUT],
  })
  @IsUUID()
  clientId: EntityId;

  @IsOptional()
  @IsUUID()
  contractorId?: EntityId;

  constructor(params: Partial<CreateContractDto> = {}) {
    Object.assign(this, params);
  }
}
