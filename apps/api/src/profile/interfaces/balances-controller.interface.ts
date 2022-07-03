import { ProfileDto } from '../dto/profile.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { ProfilesListFilterDto } from '../dto/request/profiles-list-filter.dto';
import { CreateProfileDto } from '../dto/request/create-profile.dto';
import { UpdateProfileDto } from '../dto/request/update-profile.dto';
import { EntityId } from '@libs/types';
import { MakeDepositDto } from '@app/profile/dto/request/make-deposit.dto';

export abstract class IBalancesController {
  abstract deposit(id: EntityId, dto: MakeDepositDto): Promise<ProfileDto>;
}
