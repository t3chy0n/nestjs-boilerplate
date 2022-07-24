import { MessagingProviders } from './messaging.providers';
import { LoggerModule } from '../logger/logger.module';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { DynamicModule, Module } from '@nestjs/common';
import { LazyLoaderModule } from '../lazy-loader/lazy-loader.module';
import { ExceptionsModule } from '../exceptions/exceptions.module';
import { MessagingInstaller } from '@libs/messaging/installer/messaging.installer';

@Module({
  imports: [DiscoveryModule, LazyLoaderModule],
  controllers: [],
  providers: [],
  exports: [MessagingInstaller],
})
export class MessagingModule {
  constructor(private readonly installer: MessagingInstaller) {}

  static forRoot(): DynamicModule {
    return {
      module: MessagingModule,
      imports: [DiscoveryModule, LoggerModule, ExceptionsModule.forRoot()],

      providers: [...MessagingProviders],

      exports: [MessagingInstaller, 'MESSAGING_CONNECTIONS'],
    };
  }

  static forTests(): DynamicModule {
    return {
      module: MessagingModule,
      imports: [LoggerModule.forTests(), ExceptionsModule.forTests()],

      exports: [MessagingInstaller, 'MESSAGING_CONNECTIONS'],
    };
  }
}
