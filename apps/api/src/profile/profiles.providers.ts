import { IProfilesMapper } from './interfaces/profiles-mapper.interface';
import { ProfilesMapper } from './mappers/profiles.mapper';
import { IProfilesDao } from './interfaces/profiles-dao.interface';
import { IProfilesService } from './interfaces/profiles-service.interface';
import { ProfilesService } from './services/profiles.service';
import { IProfilesController } from './interfaces/profiles-controller.interface';
import { ProfilesController } from './controllers/profiles.controller';
import { ProfilesDao } from './dao/profiles.dao';
import { IBalancesService } from '@app/profile/interfaces/balances-service.interface';
import { BalancesService } from '@app/profile/services/balances.service';
import { ILazyLoaderService } from '@libs/lazy-loader/lazy-loader-service.interface';
import { IJobsService } from '@app/job/interfaces/jobs-service.interface';
import { JobsService } from '@app/job/services/jobs.service';

export const ProfilesProviders = [
  {
    provide: IProfilesController,
    useClass: ProfilesController,
  },
  {
    provide: IProfilesMapper,
    useClass: ProfilesMapper,
  },
  {
    provide: IProfilesService,
    useClass: ProfilesService,
  },
  {
    provide: IBalancesService,
    useClass: BalancesService,
  },
  {
    provide: IProfilesDao,
    useClass: ProfilesDao,
  },
  {
    provide: IJobsService,
    useFactory: (service: ILazyLoaderService) =>
      service.lazyCreate(JobsService),
    inject: [ILazyLoaderService],
  },
];
