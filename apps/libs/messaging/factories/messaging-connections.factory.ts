import { NoEventBusFoundException } from '../exceptions/no-event-bus-found-exception';
import { MessagingDriver } from '@libs/messaging/consts';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import {
  IEventEmitterConnectionFactory,
  IKafkaConnectionFactory,
  IMessagingConnectionFactory,
  IRabbitMqConnectionFactory,
} from '@libs/messaging/interfaces/messaging-connection-factory.interface';
import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
import { Factory, Injectable } from '@libs/discovery';
import { Traced } from '@libs/telemetry/decorators/traced.decorator';
import { EventEmitterConnection } from '@libs/messaging/drivers/event-emitter/event-emitter.connection';
import { Inject } from '@nestjs/common';
import { RabbitmqConnection } from '@libs/messaging/drivers/rabbitmq/rabbitmq.connection';
import { KafkaConnection } from '@libs/messaging/drivers/kafka/kafka.connection';

@Injectable({ provide: IMessagingConnectionFactory })
@Traced
export class MessagingConnectionsFactory
  implements IMessagingConnectionFactory
{
  constructor(
    private readonly config: MessagingConfiguration,

    // private readonly rabbitMqFactory: IRabbitMqConnectionFactory, // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,
    // private readonly kafkaMqFactory: IKafkaConnectionFactory, // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,

    // private readonly eventEmitterFactory: IEventEmitterConnectionFactory, // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,
    @Inject('MESSAGING_RABBITMQ_CONNECTIONS')
    private readonly rabbitMqConnections: RabbitmqConnection[], // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,
    @Inject('MESSAGING_KAFKA_CONNECTIONS')
    private readonly kafkaConnections: KafkaConnection[], // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,
    @Inject('MESSAGING_EVENT_EMITTER_CONNECTIONS')
    private readonly eventEmitterConnections: EventEmitterConnection[], // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,
  ) {}

  // selectFactory(driver: MessagingDriver): IMessagingConnectionFactory {
    // if (MessagingDriver.RABBITMQ == driver) {
    //   return this.rabbitMqFactory;
    // }
    // if (MessagingDriver.KAFKA == driver) {
    //   return this.kafkaMqFactory;
    // }
    // if (MessagingDriver.MEMORY == driver) {
    //   return this.eventEmitterFactory;
    // }
    // throw new NoEventBusFoundException();
  // }

  @Factory({ provide: 'MESSAGING_CONNECTIONS' })
  async create(): Promise<IMessagingConnection[]> {
    const drivers = this.config.getDriversConfigurations();
    // const connections = Object.keys(drivers).map(async (driver) => {
    //   const factory = this.selectFactory(driver as MessagingDriver);
    //
    //   return await factory.create();
    // });

    const result = [
      ...this.rabbitMqConnections,
      ...this.kafkaConnections,
      ...this.eventEmitterConnections,
    ];
    return result.flatMap((connection) => connection);
  }
}
