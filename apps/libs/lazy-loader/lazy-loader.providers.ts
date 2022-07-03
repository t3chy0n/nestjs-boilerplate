import { ILazyLoaderService } from './lazy-loader-service.interface';
import { LazyLoader } from './lazy-loader.service';

export const LazyLoaderProviders = [
  {
    provide: ILazyLoaderService,
    useClass: LazyLoader,
  },
];
