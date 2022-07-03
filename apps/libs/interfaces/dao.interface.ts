import { PaginatedDataDto } from '../dto/pagination/paginated-data.dto';
import { EntityId } from '../types';

export interface IFindOneOperation<TFindOneCriteria, TEntity> {
  findOne(criteria: TFindOneCriteria): Promise<TEntity>;
}

export interface IFindOneOrFailOperation<TFindOneCriteria, TEntity> {
  findOneOrFail(criteria: TFindOneCriteria): Promise<TEntity>;
}

export interface IFindManyOperation<TFindManyCriteria, TEntity> {
  findMany(criteria: TFindManyCriteria): Promise<PaginatedDataDto<TEntity>>;
}

export interface ICreateOperation<TEntity> {
  create(entity: Partial<TEntity>): Promise<TEntity>;
}

export interface IUpdateOperation<TEntity> {
  update(id: EntityId, entity: Partial<TEntity>): Promise<TEntity>;
}

export interface IDeleteOperation {
  delete(id: EntityId): Promise<boolean>;
}

export abstract class AbstractEntityDao<
  TFindOneCriteria,
  TFindManyCriteria,
  IEntityDao,
> implements
    IFindOneOperation<TFindOneCriteria, IEntityDao>,
    IFindOneOrFailOperation<TFindOneCriteria, IEntityDao>,
    IFindManyOperation<TFindManyCriteria, IEntityDao>,
    ICreateOperation<IEntityDao>,
    IUpdateOperation<IEntityDao>,
    IDeleteOperation
{
  abstract findOneOrFail(criteria: TFindOneCriteria): Promise<IEntityDao>;
  abstract findOne(criteria: TFindOneCriteria): Promise<IEntityDao>;
  abstract findMany(
    criteria: TFindManyCriteria,
  ): Promise<PaginatedDataDto<IEntityDao>>;
  abstract create(entity: Partial<IEntityDao>): Promise<IEntityDao>;
  abstract update(
    id: EntityId,
    entity: Partial<IEntityDao>,
  ): Promise<IEntityDao>;
  abstract delete(id: EntityId): Promise<boolean>;
}
