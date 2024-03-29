import {
  MessagingInstaller,
  MessagingParamsFactory,
} from '@libs/messaging/installer/messaging.installer';
import {
  IEventEmitterConnectionFactory,
  IKafkaConnectionFactory,
  IMessagingConnectionFactory,
  IRabbitMqConnectionFactory,
} from '@libs/messaging/interfaces/messaging-connection-factory.interface';
import '@libs/messaging/factories/messaging-connections.factory';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { RabbitmqConnectionFactory } from '@libs/messaging/drivers/rabbitmq/factory/rabbitmq-connection.factory';
import { KafkaConnectionFactory } from '@libs/messaging/drivers/kafka/factory/kafka-connection.factory';
import  '@libs/messaging/drivers/event-emitter/factory/event-emitter-connection.factory';
import { Provider } from "@nestjs/common";
import {RxAmqpLib} from "@libs/messaging/drivers/rabbitmq/rx";

export const MessagingProviders: Provider[] = [
    RxAmqpLib,
  {
    provide: IRabbitMqConnectionFactory,
    useClass: RabbitmqConnectionFactory,
  },
  {
    provide: IKafkaConnectionFactory,
    useClass: KafkaConnectionFactory,
  },
  // {
  //   provide: IEventEmitterConnectionFactory,
  //   useClass: EventEmitterConnectionFactory,
  // },
  // {
  //   provide: IMessagingConnectionFactory,
  //   useClass: MessagingConnectionsFactory,
  // },

  MessagingConfiguration,
  MessagingParamsFactory,
  MessagingInstaller,

  // {
  //   provide: 'MESSAGING_CONNECTIONS',
  //   useFactory: async (factory: IMessagingConnectionFactory) =>
  //     await factory.create(),
  //   inject: [IMessagingConnectionFactory],
  // },
];
