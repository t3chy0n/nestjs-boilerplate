import { IJobsMapper } from './interfaces/jobs-mapper.interface';
import { JobsMapper } from './mappers/jobs.mapper';
import { IJobsDao } from './interfaces/jobs-dao.interface';
import { IJobsService } from './interfaces/jobs-service.interface';
import { JobsService } from './services/jobs.service';
import { IJobsController } from './interfaces/jobs-controller.interface';
import { JobsController } from './controllers/jobs.controller';
import { JobsDao } from './dao/jobs.dao';
import { ILazyLoaderService } from '@libs/lazy-loader/lazy-loader-service.interface';
import { IContractsService } from '@app/contract/interfaces/contracts-service.interface';
import { ContractsService } from '@app/contract/services/contracts.service';
import { IProfilesMapper } from '@app/profile/interfaces/profiles-mapper.interface';
import { ProfilesMapper } from '@app/profile/mappers/profiles.mapper';
import { Provider } from '@nestjs/common';

export const JobsProviders: Provider[] = [
  {
    provide: IJobsController,
    useClass: JobsController,
  },
  {
    provide: IJobsMapper,
    useClass: JobsMapper,
  },
  {
    provide: IJobsService,
    useClass: JobsService,
  },
  {
    provide: IJobsDao,
    useClass: JobsDao,
  },

  {
    provide: IContractsService,
    useFactory: (service: ILazyLoaderService) =>
      service.lazyCreate(ContractsService),
    inject: [ILazyLoaderService],
  },

  {
    provide: IProfilesMapper,
    useFactory: (service: ILazyLoaderService) => service.create(ProfilesMapper),
    inject: [ILazyLoaderService],
  },
];
