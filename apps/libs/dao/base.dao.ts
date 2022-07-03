import { SortByDto } from '../dto/sorting/sort-by.dto';

export class BaseDao {
  toSortOptions(
    sort: SortByDto[],
    model = '',
  ): { [key: string]: 'ASC' | 'DESC' } {
    const sorting = {};
    const numToOrder = {
      '-1': 'ASC',
      '1': 'DESC',
    };

    sort?.forEach((item) => {
      const key = model ? ` ${model}.${item.property}` : item.property;
      sorting[key] = numToOrder[item.sort] || item.sort;
    });

    return sorting;
  }
}
