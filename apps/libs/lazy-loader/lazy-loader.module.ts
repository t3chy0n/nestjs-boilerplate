import {DynamicModule, Global, Module} from '@nestjs/common';
import { ILazyLoaderService } from './lazy-loader-service.interface';
import { LazyLoaderProviders } from './lazy-loader.providers';

@Module({
  providers: [...LazyLoaderProviders],
  exports: [ILazyLoaderService],
})
export class LazyLoaderModule {
  static forRoot(): DynamicModule {
    return {
      module: LazyLoaderModule,
      providers: [...LazyLoaderProviders],
      exports: [ILazyLoaderService],
    };
  }
}
