import { PaginationOptionsDto } from '../pagination/pagination-options.dto';
import { SortByDto } from '../sorting/sort-by.dto';

export class BaseListCriteriaDto extends PaginationOptionsDto {
  skip?: number;
  limit?: number;
  sort?: SortByDto[];
  createdAtToDate?: Date;
  createdAtFromDate?: Date;

  updatedAtToDate?: Date;
  updatedAtFromDate?: Date;

  get createdAtCriteria(): boolean {
    return !!this.createdAtFromDate && !!this.createdAtToDate;
  }

  get updatedAtAtCriteria(): boolean {
    return !!this.updatedAtFromDate && !!this.updatedAtToDate;
  }
}
