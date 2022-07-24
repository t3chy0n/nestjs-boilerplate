import { RabbitmqConnection } from '../rabbitmq.connection';
import { Options } from 'amqplib';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
import { ILogger } from '@libs/logger/logger.interface';
import { IMessagingConnectionFactory } from '@libs/messaging/interfaces/messaging-connection-factory.interface';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { MessagingDriver } from '@libs/messaging/consts';
import { ILazyLoaderService } from '@libs/lazy-loader/lazy-loader-service.interface';

@Injectable()
export class RabbitmqConnectionFactory implements IMessagingConnectionFactory {
  constructor(
    private config: MessagingConfiguration,
    private readonly lazy: ILazyLoaderService,
    private readonly logger: ILogger,
  ) {}

  create(): Promise<IMessagingConnection>[] {
    const connections: Options.Connect[] =
      this.config.getConnectionsConfigurations(MessagingDriver.RABBITMQ);

    const results = connections.map(async (configData: any) => {
      const isSSL = configData.protocol === 'amqps';

      const socketOptions = {
        /***
         * SSL on RabbitMQ on Aws behaves wierd, needs to have cert commited.
         * TODO: Try to find a proper solution for this.
         */
        ...(isSSL && {
          ca: [fs.readFileSync('config/rabbit-mq.pem')],
          //TODO: We need to see how we can setup SSL properly with AMQP
          rejectUnauthorized: false,
        }),
      };
      return await this.lazy.create(
        RabbitmqConnection,
        configData,
        socketOptions,
      );
    });

    return results;
  }
}
