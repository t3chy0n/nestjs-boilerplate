import { Transform, TransformFnParams } from 'class-transformer';
import { SortByDto } from './sort-by.dto';

export function TransformSortParams() {
  return Transform((options: TransformFnParams): SortByDto[] => {
    const value = options.obj[options.key] || '';
    const sortByProperties = value.trim().split(',');

    return sortByProperties
      .filter((property) => property.trim())
      .map((property: string) => SortByDto.parse(property));
  });
}
