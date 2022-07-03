import { ApiProperty } from '@nestjs/swagger';

export class PaginationResultDto {
  @ApiProperty()
  limit?: number;

  @ApiProperty()
  skip?: number;

  @ApiProperty()
  total: number;
}
