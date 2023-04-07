import { Injectable } from '@nestjs/common';
import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
import { ILogger } from '@libs/logger/logger.interface';
import { IMessagingConnectionFactory } from '@libs/messaging/interfaces/messaging-connection-factory.interface';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { MessagingDriver } from '@libs/messaging/consts';
import { ILazyLoaderService } from '@libs/lazy-loader/lazy-loader-service.interface';
import { KafkaConnection } from '@libs/messaging/drivers/kafka/kafka.connection';

@Injectable()
export class KafkaConnectionFactory implements IMessagingConnectionFactory {
  constructor(
    private config: MessagingConfiguration,
    private readonly lazy: ILazyLoaderService,
    private readonly logger: ILogger,
  ) {}

  create(): Promise<IMessagingConnection>[] {
    const connections: any[] = this.config.getConnectionsConfigurations(
      MessagingDriver.KAFKA,
    );

    const results = connections.map(async (configData: any) => {
      return await this.lazy.resolve(KafkaConnection, configData);
    });

    return results;
  }
}
