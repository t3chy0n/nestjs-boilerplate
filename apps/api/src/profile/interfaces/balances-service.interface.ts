import { Profile } from '@app/profile/entities/profile.entity';
import { MakeDepositCriteriaDto } from '@app/profile/dto/criteria/make-deposit-criteria.dto';

export abstract class IBalancesService {
  abstract deposit(criteria: MakeDepositCriteriaDto): Promise<Profile>;
}
