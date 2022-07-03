import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { DateRangeFilterDto } from '@app/job/dto/request/date-range-filter.dto';
import { ProfileDto } from '@app/profile/dto/profile.dto';
import { RankingProfessionDto } from '@app/job/dto/ranking-profession.dto';

export abstract class IAdminController {
  abstract bestProfession(
    dto: DateRangeFilterDto,
  ): Promise<PaginatedDataDto<RankingProfessionDto>>;

  abstract bestClients(
    dto: DateRangeFilterDto,
  ): Promise<PaginatedDataDto<ProfileDto>>;
}
