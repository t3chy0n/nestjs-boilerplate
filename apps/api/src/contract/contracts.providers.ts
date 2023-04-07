import { IContractsMapper } from './interfaces/contracts-mapper.interface';
import { ContractsMapper } from './mappers/contracts.mapper';
import { IContractsDao } from './interfaces/contracts-dao.interface';
import { IContractsService } from './interfaces/contracts-service.interface';
import { ContractsService } from './services/contracts.service';
import { IContractsController } from './interfaces/contracts-controller.interface';
import { ContractController } from './controllers/contract.controller';
import { ContractsDao } from './dao/contracts.dao';
import { IProfilesService } from '@app/profile/interfaces/profiles-service.interface';
import { ILazyLoaderService } from '@libs/lazy-loader/lazy-loader-service.interface';
import { ProfilesService } from '@app/profile/services/profiles.service';
import { Provider } from '@nestjs/common';

export const ContractsProviders: Provider[] = [
  {
    provide: IContractsController,
    useClass: ContractController,
  },
  {
    provide: IContractsMapper,
    useClass: ContractsMapper,
  },
  {
    provide: IContractsService,
    useClass: ContractsService,
  },
  {
    provide: IContractsDao,
    useClass: ContractsDao,
  },
  {
    provide: IProfilesService,
    useFactory: (service: ILazyLoaderService) =>
      service.lazyCreate(ProfilesService),
    inject: [ILazyLoaderService],
  },
];
