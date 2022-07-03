import { IRequestContextService } from './interfaces/request-context-service.interface';
import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { RequestContextService } from './request-context.service';
import { AsyncLocalStorage } from 'async_hooks';
import { RequestContextDto } from './request-context.dto';
import {
  RequestContextAsyncLocalStorage,
  RequestContextAsyncLocalStorageStub,
} from './request-context.als';
import {
  RequestContextInitMiddleware,
  RequestContextMiddleware,
} from './request-context.middleware';
import { IConfiguration } from '../configuration/interfaces/configuration.interface';

const globalRequestContextStore = new AsyncLocalStorage<RequestContextDto>();

@Global()
@Module({
  imports: [],
  providers: [
    RequestContextMiddleware,
    RequestContextInitMiddleware,
    {
      provide: IRequestContextService,
      useClass: RequestContextService,
    },
    {
      provide: RequestContextAsyncLocalStorage,
      useFactory: () => globalRequestContextStore,
    },
  ],
  exports: [
    IRequestContextService,
    RequestContextMiddleware,
    RequestContextInitMiddleware,
  ],
})
export class RequestContextModule {
  constructor(
    private readonly init: RequestContextInitMiddleware,
    private readonly context: RequestContextMiddleware,
    private readonly config: IConfiguration,
  ) {}

  static forTests(): DynamicModule {
    return {
      module: RequestContextModule,
      imports: [],
      providers: [
        RequestContextMiddleware,
        RequestContextInitMiddleware,
        {
          provide: IRequestContextService,
          useClass: RequestContextService,
        },
        {
          provide: RequestContextAsyncLocalStorage,
          useClass: RequestContextAsyncLocalStorageStub,
        },
      ],
      exports: [],
    };
  }

  //Applies request context middlewares
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(this.init.use.bind(this.init), this.context.use.bind(this.context))
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }
}
