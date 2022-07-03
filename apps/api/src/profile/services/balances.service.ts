import { IBalancesService } from '@app/profile/interfaces/balances-service.interface';
import { MakeDepositCriteriaDto } from '@app/profile/dto/criteria/make-deposit-criteria.dto';
import { Profile } from '@app/profile/entities/profile.entity';
import { IProfilesDao } from '@app/profile/interfaces/profiles-dao.interface';
import { IProfilesMapper } from '@app/profile/interfaces/profiles-mapper.interface';
import { IJobsService } from '@app/job/interfaces/jobs-service.interface';
import { JobListCriteria } from '@app/job/dto/criteria/jobs-list-criteria.dto';
import { Injectable } from '@nestjs/common';
import { CannotMakeDepositException } from '@app/profile/exceptions/cannot-make-deposit.exception';
import { ProfileCriteria } from '@app/profile/dto/criteria/profile-criteria.dto';

const MAX_ALLOWED_PERCENTAGE_OF_ALL_JOBS_PAY = 25;

@Injectable()
export class BalancesService implements IBalancesService {
  constructor(
    private readonly profilesDao: IProfilesDao,
    private readonly jobsService: IJobsService,
    private readonly mapper: IProfilesMapper,
  ) {}

  async deposit(criteria: MakeDepositCriteriaDto): Promise<Profile> {
    const profile = await this.profilesDao.findOneOrFail(
      new ProfileCriteria({ id: criteria.clientId }),
    );
    const total = await this.jobsService.totalJobsPay(
      new JobListCriteria({ clientId: criteria.clientId }),
    );

    const maxAlloweddeposit =
      (total * MAX_ALLOWED_PERCENTAGE_OF_ALL_JOBS_PAY) / 100;

    if (total >= maxAlloweddeposit) {
      throw new CannotMakeDepositException().params(criteria);
    }

    return await this.profilesDao.update(profile.id, {
      balance: parseFloat(profile.balance.toString()) + criteria.amount,
    });
  }
}
