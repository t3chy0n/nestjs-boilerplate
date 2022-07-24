import {
  MessagingInstaller,
  MessagingParamsFactory,
} from '@libs/messaging/installer/messaging.installer';
import {
  IKafkaConnectionFactory,
  IMessagingConnectionFactory,
  IRabbitMqConnectionFactory,
} from '@libs/messaging/interfaces/messaging-connection-factory.interface';
import { MessagingConnectionsFactory } from '@libs/messaging/factories/messaging-connections.factory';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { RabbitmqConnectionFactory } from '@libs/messaging/drivers/rabbitmq/factory/rabbitmq-connection.factory';
import { KafkaConnectionFactory } from '@libs/messaging/drivers/kafka/factory/kafka-connection.factory';

export const MessagingProviders = [
  {
    provide: IRabbitMqConnectionFactory,
    useClass: RabbitmqConnectionFactory,
  },
  {
    provide: IKafkaConnectionFactory,
    useClass: KafkaConnectionFactory,
  },
  {
    provide: IMessagingConnectionFactory,
    useClass: MessagingConnectionsFactory,
  },

  MessagingConfiguration,
  MessagingParamsFactory,
  MessagingInstaller,

  {
    provide: 'MESSAGING_CONNECTIONS',
    useFactory: async (factory: IMessagingConnectionFactory) =>
      await factory.create(),
    inject: [IMessagingConnectionFactory],
  },
];
