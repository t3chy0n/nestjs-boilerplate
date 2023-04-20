import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { IMessagingConnectionFactory } from '@libs/messaging/interfaces/messaging-connection-factory.interface';
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

    @Inject('MESSAGING_RABBITMQ_CONNECTIONS')
    private readonly rabbitMqConnections: RabbitmqConnection[], // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,
    @Inject('MESSAGING_KAFKA_CONNECTIONS')
    private readonly kafkaConnections: KafkaConnection[], // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,
    @Inject('MESSAGING_EVENT_EMITTER_CONNECTIONS')
    private readonly eventEmitterConnections: EventEmitterConnection[], // private readonly eventEmitterFactory: IEventEmitterEventBusConnectionFactory,
  ) {}

  @Factory({ provide: 'MESSAGING_CONNECTIONS' })
  async create(): Promise<IMessagingConnection[]> {
    const drivers = this.config.getDriversConfigurations();

    const result = [
      ...this.rabbitMqConnections,
      ...this.kafkaConnections,
      ...this.eventEmitterConnections,
    ];
    return result.flatMap((connection) => connection);
  }
}
