import { ApiProperty } from '@nestjs/swagger';
import { PaginationResultDto } from './pagination-result.dto';

export class PaginatedDataDto<T> extends PaginationResultDto {
  @ApiProperty({ type: 'object' })
  data: T[];

  constructor(params: Partial<PaginatedDataDto<T>> = {}) {
    super();
    Object.assign(this, params);
  }
}
