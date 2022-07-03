import { BaseListCriteriaDto } from '@libs/dto/criteria/base-list-criteria.dto';

export class DateRangeCriteriaDto extends BaseListCriteriaDto {
  start: Date;

  end: Date;

  constructor(params: Partial<DateRangeCriteriaDto> = {}) {
    super();
    Object.assign(this, params);
  }
}
