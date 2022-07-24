import { Injectable } from '@nestjs/common';
import { NoEventBusFoundException } from '../exceptions/no-event-bus-found-exception';
import { MessagingDriver } from '@libs/messaging/consts';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import {
  IEventEmitterEventBusConnectionFactory,
  IKafkaConnectionFactory,
  IMessagingConnectionFactory,
  IRabbitMqConnectionFactory,
} from '@libs/messaging/interfaces/messaging-connection-factory.interface';
import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';

@Injectable()
export class MessagingConnectionsFactory {
  constructor(
    private readonly config: MessagingConfiguration,

    private readonly rabbitMqFactory: IRabbitMqConnectionFactory, // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,
    private readonly kafkaMqFactory: IKafkaConnectionFactory, // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,
  ) {}

  selectFactory(driver: MessagingDriver): IMessagingConnectionFactory {
    if (MessagingDriver.RABBITMQ == driver) {
      return this.rabbitMqFactory;
    }
    if (MessagingDriver.KAFKA == driver) {
      return this.kafkaMqFactory;
    }
    // if (MessagingDriver.MEMORY == driver) {
    //   return this.eventEmitterFactory;
    // }
    throw new NoEventBusFoundException();
  }

  async create(): Promise<IMessagingConnection[]> {
    const drivers = this.config.getDriversConfigurations();
    const connections = Object.keys(drivers).map(async (driver) => {
      const factory = this.selectFactory(driver as MessagingDriver);

      return await Promise.all(factory.create());
    });

    const result = await Promise.all(connections);
    return result.flatMap((connection) => connection);
  }
}
