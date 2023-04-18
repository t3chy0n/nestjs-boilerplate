import { RabbitmqConnection } from '../rabbitmq.connection';
import { Options } from 'amqplib';
import * as fs from 'fs';
import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
import { ILogger } from '@libs/logger/logger.interface';
import { IMessagingConnectionFactory } from '@libs/messaging/interfaces/messaging-connection-factory.interface';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { MessagingDriver } from '@libs/messaging/consts';
import { ILazyLoaderService } from '@libs/lazy-loader/lazy-loader-service.interface';
import {Factory, Injectable} from "@libs/discovery";
import {Traced} from "@libs/telemetry/decorators/traced.decorator";
import {ModuleRef} from "@nestjs/core";
import {ITracing} from "@libs/telemetry/tracing.interface";
import {DependencyIndex} from "@libs/discovery/utils";

const DEFAULT_RABBITMQ_CONNECTION_TIMEOUT = 4000;
@Traced

@Injectable()
export class RabbitmqConnectionFactory implements IMessagingConnectionFactory {
  constructor(
    private config: MessagingConfiguration,
    private readonly lazy: ILazyLoaderService,
    private readonly logger: ILogger,
  ) {}

  @Factory({ provide: 'MESSAGING_RABBITMQ_CONNECTIONS' })
  create(): Promise<IMessagingConnection[]>{
    const connections: Options.Connect[] =
      this.config.getConnectionsConfigurations(MessagingDriver.RABBITMQ);

    const results = connections.map(async (configData: any) => {
      const isSSL = configData.protocol === 'amqps';

      const socketOptions = {
        timeout: DEFAULT_RABBITMQ_CONNECTION_TIMEOUT,

        ...(isSSL && {
          rejectUnauthorized: false,
        }),
      };
      return await this.lazy.resolveBean(
        RabbitmqConnection,
        configData,
        socketOptions,
      );
    });

    return Promise.all(results);
  }
}
