import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
import { ILogger } from '@libs/logger/logger.interface';
import {
  IEventEmitterConnectionFactory,
  IMessagingConnectionFactory,
} from '@libs/messaging/interfaces/messaging-connection-factory.interface';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { MessagingDriver } from '@libs/messaging/consts';
import { ILazyLoaderService } from '@libs/lazy-loader/lazy-loader-service.interface';
import { KafkaConnection } from '@libs/messaging/drivers/kafka/kafka.connection';
import { EventEmitterConnection } from '@libs/messaging/drivers/event-emitter/event-emitter.connection';
import { Factory, Injectable } from '@libs/discovery';
import { Traced } from '@libs/telemetry/decorators/traced.decorator';
import { wireBeanProxy } from '@libs/testing/test';
import { ModuleRef } from '@nestjs/core';
import { ITracing } from '@libs/telemetry/tracing.interface';

@Injectable({ provide: IEventEmitterConnectionFactory })
@Traced
export class EventEmitterConnectionFactory
  implements IMessagingConnectionFactory
{
  constructor(
    private config: MessagingConfiguration,
    private readonly lazy: ILazyLoaderService,
    private readonly logger: ILogger,
  ) {}

  @Factory({ provide: 'MESSAGING_EVENT_EMITTER_CONNECTIONS' })
  create(): Promise<IMessagingConnection[]> {
    const connections: any[] = this.config.getConnectionsConfigurations(
      MessagingDriver.MEMORY,
    );

    const results = connections.map(async (configData: any) => {
      return this.lazy.resolveBean(EventEmitterConnection, configData);
    });

    return Promise.all(results);
  }
}
