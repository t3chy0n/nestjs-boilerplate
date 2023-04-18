import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';

export abstract class IMessagingConnectionFactory {
  abstract create(): Promise<IMessagingConnection[]>;
}

export abstract class IRabbitMqConnectionFactory extends IMessagingConnectionFactory {}
export abstract class IKafkaConnectionFactory extends IMessagingConnectionFactory {}
export abstract class ISqsConnectionFactory extends IMessagingConnectionFactory {}
export abstract class IEventEmitterConnectionFactory extends IMessagingConnectionFactory {}
