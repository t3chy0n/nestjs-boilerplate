import { PaginatedDataDto } from '../dto/pagination/paginated-data.dto';

/***
 * Generic interface for mapping filters dto, into criteria
 */
export abstract class ICriteriaMapper<TFilters, TCriteria> {
  abstract toCriteria(filters: TFilters): TCriteria;
}

/***
 * Generic interface for mapping filters dto, into criteria
 */
export abstract class ITypeormCriteriaMapper<TCriteria> {
  abstract toTypeormCriteria(filters: TCriteria): any;
}

/***
 * Generic interface for model mapper, transforms entities to dtos
 */
export abstract class IModelMapper<TEntity, TDto, TCriteria = null> {
  abstract toDto(entity: TEntity, criteria?: TCriteria): TDto;

  abstract toDtos(entities: TEntity[], criteria?: TCriteria): TDto[];

  abstract toPaginatedDto(
    entities: PaginatedDataDto<TEntity>,
    criteria?: TCriteria,
  ): PaginatedDataDto<TDto>;
}

/***
 * Generic interface for asynchronous model mapper, transforms entities to dtos
 */
export abstract class IAsyncModelMapper<TEntity, TDto, TCriteria = null> {
  abstract toDto(entity: TEntity, criteria?: TCriteria): Promise<TDto>;

  abstract toDtos(entities: TEntity[], criteria?: TCriteria): Promise<TDto[]>;

  abstract toPaginatedDto(
    entities: PaginatedDataDto<TEntity>,
    criteria?: TCriteria,
  ): Promise<PaginatedDataDto<TDto>>;
}

export abstract class IEntityMapper<TDto, TEntity> {
  abstract toEntity(dto: TDto): Partial<TEntity>;
}

export abstract class IAsyncEntityMapper<TDto, TEntity> {
  abstract toEntity(dto: TDto): Promise<TEntity>;
}
