import { PartialType } from '@nestjs/swagger';
import { CreateContractDto } from './create-contract.dto';

export class UpdateContractDto extends PartialType(CreateContractDto) {
  constructor(params: Partial<UpdateContractDto> = {}) {
    super(params);
    Object.assign(this, params);
  }
}
