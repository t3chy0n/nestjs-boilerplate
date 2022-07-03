import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Max } from 'class-validator';

const MAX_LIMIT = 100;

export class PaginationOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Max(MAX_LIMIT)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  skip?: number;
}
