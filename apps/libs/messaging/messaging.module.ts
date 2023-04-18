import { MessagingProviders } from './messaging.providers';
import { LoggerModule } from '../logger/logger.module';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { DynamicModule } from '@nestjs/common';
import { LazyLoaderModule } from '../lazy-loader/lazy-loader.module';
import { ExceptionsModule } from '../exceptions/exceptions.module';
import { MessagingInstaller } from '@libs/messaging/installer/messaging.installer';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { Module } from '@libs/discovery';
import './factories/messaging-connections.factory';
import './drivers/event-emitter/factory/event-emitter-connection.factory';
import { TelemetryModule } from '@libs/telemetry/telemetry.module';

@Module({
  imports: [
    DiscoveryModule,
    LoggerModule,
    LazyLoaderModule,
    TelemetryModule,
    ExceptionsModule.forRoot(),
  ],

  providers: [...MessagingProviders],

  exports: [
    MessagingInstaller,
    MessagingConfiguration,
    'MESSAGING_CONNECTIONS',
  ],
})
export class MessagingModule {
  // constructor(private readonly installer: MessagingInstaller) {}

  static forRoot(): DynamicModule {
    return {
      module: MessagingModule,
      imports: [
        DiscoveryModule,
        LoggerModule,
        TelemetryModule,
        ExceptionsModule.forRoot(),
      ],

      providers: [...MessagingProviders],

      exports: [
        MessagingInstaller,
        MessagingConfiguration,
        'MESSAGING_CONNECTIONS',
      ],
    };
  }
}
